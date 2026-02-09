import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {PAYMENT_HOLD_MINUTES} from "@/shared/lib/orders/lifecycle";

type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};

const EXPIRABLE_STATUSES = ["reserved", "awaiting_payment", "payment_pending", "pending"];

function readCronSecret(req: Request) {
    const direct =
        req.headers.get("x-booking-cron-secret")?.trim() ||
        req.headers.get("x-cron-secret")?.trim();
    if (direct) return direct;

    const auth = req.headers.get("authorization")?.trim() ?? "";
    const bearerPrefix = "bearer ";
    if (auth.toLowerCase().startsWith(bearerPrefix)) {
        return auth.slice(bearerPrefix.length).trim();
    }
    return "";
}

function isMissingOrderLifecycleColumns(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && (joined.includes("payment_due_at") || joined.includes("paid_at"));
}

function isMissingCancelMetaColumns(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && (joined.includes("cancel_reason") || joined.includes("cancelled_by_user_at"));
}

function toChunks<T>(items: T[], size: number) {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        out.push(items.slice(i, i + size));
    }
    return out;
}

async function readExpirableIds(admin: ReturnType<typeof createSupabaseAdminClient>) {
    const now = new Date();
    const nowIso = now.toISOString();
    const legacyCutoffIso = new Date(now.getTime() - PAYMENT_HOLD_MINUTES * 60 * 1000).toISOString();

    const dueRes = await admin
        .from("orders")
        .select("id")
        .in("status", EXPIRABLE_STATUSES)
        .is("paid_at", null)
        .lte("payment_due_at", nowIso)
        .limit(2000);

    let dueError = dueRes.error as PostgrestErrorLike | null;
    let dueData = dueRes.data ?? [];

    const noDueRes = await admin
        .from("orders")
        .select("id")
        .in("status", EXPIRABLE_STATUSES)
        .is("paid_at", null)
        .is("payment_due_at", null)
        .lte("created_at", legacyCutoffIso)
        .limit(2000);

    let noDueError = noDueRes.error as PostgrestErrorLike | null;
    let noDueData = noDueRes.data ?? [];

    const missingLifecycle = isMissingOrderLifecycleColumns(dueError) || isMissingOrderLifecycleColumns(noDueError);
    if (missingLifecycle) {
        const fallbackRes = await admin
            .from("orders")
            .select("id")
            .in("status", EXPIRABLE_STATUSES)
            .lte("created_at", legacyCutoffIso)
            .limit(2000);

        dueError = fallbackRes.error as PostgrestErrorLike | null;
        noDueError = null;
        dueData = fallbackRes.data ?? [];
        noDueData = [];
    }

    if (dueError) return {error: dueError.message ?? "Failed to read expirable orders", ids: [] as string[], withPaidGuard: false};
    if (noDueError) return {error: noDueError.message ?? "Failed to read expirable orders", ids: [] as string[], withPaidGuard: false};

    const ids = Array.from(
        new Set(
            [...dueData, ...noDueData]
                .map((row) => String((row as {id?: string}).id ?? "").trim())
                .filter(Boolean)
        )
    );

    return {
        error: null,
        ids,
        withPaidGuard: !missingLifecycle,
        nowIso,
    };
}

async function expireIds(
    admin: ReturnType<typeof createSupabaseAdminClient>,
    ids: string[],
    nowIso: string,
    withPaidGuard: boolean
) {
    if (ids.length === 0) return {error: null, affected: 0};

    let affected = 0;
    const batches = toChunks(ids, 500);

    for (const batch of batches) {
        let query = admin
            .from("orders")
            .update({
                status: "cancelled",
                cancelled_at: nowIso,
                cancel_reason: "payment_timeout",
            })
            .in("id", batch)
            .in("status", EXPIRABLE_STATUSES);

        if (withPaidGuard) {
            query = query.is("paid_at", null);
        }

        let updateRes = await query.select("id");
        if (isMissingCancelMetaColumns(updateRes.error as PostgrestErrorLike | null)) {
            let fallbackQuery = admin
                .from("orders")
                .update({
                    status: "cancelled",
                    cancelled_at: nowIso,
                })
                .in("id", batch)
                .in("status", EXPIRABLE_STATUSES);
            if (withPaidGuard) {
                fallbackQuery = fallbackQuery.is("paid_at", null);
            }
            updateRes = await fallbackQuery.select("id");
        }

        if (updateRes.error) {
            return {
                error: updateRes.error.message ?? "Failed to update expirable orders",
                affected,
            };
        }

        affected += updateRes.data?.length ?? 0;
    }

    return {error: null, affected};
}

async function run(req: Request) {
    const expectedSecret = String(
        process.env.BOOKING_CRON_SECRET ?? process.env.CRON_SECRET ?? ""
    ).trim();
    if (!expectedSecret) {
        return NextResponse.json(
            {error: "BOOKING_CRON_SECRET (or CRON_SECRET) is not configured"},
            {status: 500}
        );
    }

    const providedSecret = readCronSecret(req);
    if (!providedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const admin = createSupabaseAdminClient();
    const readRes = await readExpirableIds(admin);
    if (readRes.error) {
        return NextResponse.json({error: readRes.error}, {status: 500});
    }

    const expireRes = await expireIds(
        admin,
        readRes.ids,
        readRes.nowIso ?? new Date().toISOString(),
        readRes.withPaidGuard
    );
    if (expireRes.error) {
        return NextResponse.json({error: expireRes.error}, {status: 500});
    }

    return NextResponse.json(
        {
            ok: true,
            scanned: readRes.ids.length,
            expired: expireRes.affected,
        },
        {status: 200}
    );
}

export async function GET(req: Request) {
    return run(req);
}

export async function POST(req: Request) {
    return run(req);
}
