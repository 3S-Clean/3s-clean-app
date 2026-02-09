import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {normalizeDisplayStatus} from "@/shared/lib/orders/lifecycle";

type LifecycleStatus =
    | "reserved"
    | "awaiting_payment"
    | "expired"
    | "payment_pending"
    | "paid"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "refunded";

type WebhookBody = {
    orderId?: unknown;
    nextStatus?: unknown;
    event?: unknown;
    occurredAt?: unknown;
};

type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};

type OrderLifecycleRow = {
    id: string;
    status: string | null;
    created_at: string | null;
    payment_due_at?: string | null;
    confirmed_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
};

const EVENT_TO_STATUS: Record<string, LifecycleStatus> = {
    "payment.pending": "payment_pending",
    "payment.succeeded": "paid",
    "payment.refunded": "refunded",
    "booking.reserved": "reserved",
};

const ALLOWED_TRANSITIONS: Record<LifecycleStatus, Set<LifecycleStatus>> = {
    awaiting_payment: new Set(["payment_pending", "paid", "expired", "cancelled"]),
    payment_pending: new Set(["paid", "expired", "cancelled"]),
    paid: new Set(["reserved", "in_progress", "refunded", "cancelled"]),
    reserved: new Set(["payment_pending", "paid", "in_progress", "cancelled", "refunded"]),
    in_progress: new Set(["completed", "cancelled", "refunded"]),
    completed: new Set(["refunded"]),
    expired: new Set(["cancelled"]),
    cancelled: new Set(["refunded"]),
    refunded: new Set(),
};

function parseStatus(v: unknown): LifecycleStatus | null {
    const raw = String(v ?? "").trim().toLowerCase();
    switch (raw) {
        case "reserved":
            return "reserved";
        case "awaiting_payment":
        case "pending": // legacy
            return "awaiting_payment";
        case "expired":
            return "expired";
        case "payment_pending":
            return "payment_pending";
        case "paid":
            return "paid";
        case "in_progress":
            return "in_progress";
        case "completed":
            return "completed";
        case "cancelled":
            return "cancelled";
        case "refunded":
            return "refunded";
        case "confirmed": // legacy
            return "reserved";
        default:
            return null;
    }
}

function nextStatusFromBody(body: WebhookBody) {
    const direct = parseStatus(body.nextStatus);
    if (direct) return direct;
    const event = String(body.event ?? "").trim().toLowerCase();
    return event ? EVENT_TO_STATUS[event] ?? null : null;
}

function toIso(v: unknown) {
    const raw = String(v ?? "").trim();
    if (!raw) return new Date().toISOString();
    const ms = Date.parse(raw);
    return Number.isNaN(ms) ? new Date().toISOString() : new Date(ms).toISOString();
}

function readWebhookSecret(req: Request) {
    const direct = req.headers.get("x-booking-webhook-secret")?.trim();
    if (direct) return direct;
    const auth = req.headers.get("authorization")?.trim() ?? "";
    const bearerPrefix = "bearer ";
    if (auth.toLowerCase().startsWith(bearerPrefix)) {
        return auth.slice(bearerPrefix.length).trim();
    }
    return "";
}

function isMissingPaidAtColumn(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && joined.includes("paid_at");
}

function isStatusConstraintError(error: PostgrestErrorLike | null) {
    if (!error) return false;
    if (error.code !== "23514") return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return joined.includes("status");
}

export async function POST(req: Request) {
    const configuredSecret = String(process.env.BOOKING_WEBHOOK_SECRET ?? "").trim();
    if (!configuredSecret) {
        return NextResponse.json(
            {error: "BOOKING_WEBHOOK_SECRET is not configured"},
            {status: 500}
        );
    }

    const providedSecret = readWebhookSecret(req);
    if (!providedSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    let body: WebhookBody = {};
    try {
        body = (await req.json()) as WebhookBody;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const orderId = String(body.orderId ?? "").trim();
    if (!orderId) return NextResponse.json({error: "Missing orderId"}, {status: 400});

    const nextStatus = nextStatusFromBody(body);
    if (!nextStatus) {
        return NextResponse.json(
            {error: "Missing nextStatus (or unknown event mapping)"},
            {status: 400}
        );
    }

    const admin = createSupabaseAdminClient();
    const {data: order, error: findError} = await admin
        .from("orders")
        .select("id,status,created_at,payment_due_at,confirmed_at,completed_at,cancelled_at")
        .eq("id", orderId)
        .maybeSingle();

    if (findError) return NextResponse.json({error: findError.message}, {status: 500});
    if (!order) return NextResponse.json({error: "Order not found"}, {status: 404});

    const row = order as OrderLifecycleRow;
    const currentStatus = parseStatus(
        normalizeDisplayStatus(
            {
                status: row.status,
                created_at: row.created_at,
                payment_due_at: row.payment_due_at,
            },
            Date.now()
        )
    );

    if (!currentStatus) {
        return NextResponse.json(
            {error: `Unsupported current status: ${String(row.status ?? "null")}`},
            {status: 409}
        );
    }

    if (currentStatus === nextStatus) {
        return NextResponse.json(
            {
                ok: true,
                idempotent: true,
                orderId,
                from: currentStatus,
                to: nextStatus,
            },
            {status: 200}
        );
    }

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowedNext.has(nextStatus)) {
        return NextResponse.json(
            {error: `Invalid transition: ${currentStatus} -> ${nextStatus}`},
            {status: 409}
        );
    }

    const at = toIso(body.occurredAt);
    const patch: Record<string, unknown> = {
        status: nextStatus,
    };
    if (nextStatus === "paid") {
        patch.paid_at = at;
    }
    if (nextStatus === "reserved" && !row.confirmed_at) {
        patch.confirmed_at = at;
    }
    if (nextStatus === "completed" && !row.completed_at) {
        patch.completed_at = at;
    }
    if ((nextStatus === "cancelled" || nextStatus === "expired") && !row.cancelled_at) {
        patch.cancelled_at = at;
    }

    let updateRes = await admin
        .from("orders")
        .update(patch)
        .eq("id", orderId)
        .select("id,status")
        .single();

    if (isMissingPaidAtColumn(updateRes.error as PostgrestErrorLike | null) && "paid_at" in patch) {
        const retryPatch = {...patch};
        delete retryPatch.paid_at;
        updateRes = await admin
            .from("orders")
            .update(retryPatch)
            .eq("id", orderId)
            .select("id,status")
            .single();
    }

    if (updateRes.error) {
        if (isStatusConstraintError(updateRes.error as PostgrestErrorLike | null)) {
            return NextResponse.json(
                {
                    error: "Status is not allowed by DB constraint. Run migration 20260209173000_orders_status_lifecycle_v2.sql",
                },
                {status: 409}
            );
        }
        return NextResponse.json({error: updateRes.error.message}, {status: 500});
    }

    return NextResponse.json(
        {
            ok: true,
            orderId,
            from: currentStatus,
            to: nextStatus,
        },
        {status: 200}
    );
}
