import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {normalizeDisplayStatus} from "@/shared/lib/orders/lifecycle";

type Body = { orderId?: unknown };
type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};

const CANCELLABLE = new Set([
    "awaiting_payment",
    "payment_pending",
    "reserved",
    "paid",
    // legacy compatibility
    "pending",
    "confirmed",
]);

function isMissingCancelMetaColumns(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && (joined.includes("cancel_reason") || joined.includes("cancelled_by_user_at"));
}

export async function POST(req: Request) {
    let body: Body = {};
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }
    const orderId = String(body.orderId ?? "").trim();
    if (!orderId) return NextResponse.json({error: "Missing orderId"}, {status: 400});

    const supabase = await createSupabaseServerClient();
    const {
        data: {user},
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const admin = createSupabaseAdminClient();
    const {data: found, error: findError} = await admin
        .from("orders")
        .select("id,user_id,status,created_at,payment_due_at")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (findError) return NextResponse.json({error: findError.message}, {status: 500});
    if (!found) return NextResponse.json({error: "Order not found"}, {status: 404});

    const normalizedStatus = normalizeDisplayStatus(found);
    if (!CANCELLABLE.has(normalizedStatus)) {
        return NextResponse.json({error: "Order cannot be cancelled in current state"}, {status: 409});
    }

    const nowIso = new Date().toISOString();
    let {error: updateError} = await admin
        .from("orders")
        .update({
            status: "cancelled",
            cancelled_at: nowIso,
            cancelled_by_user_at: nowIso,
            cancel_reason: "user_cancelled",
        })
        .eq("id", orderId)
        .eq("user_id", user.id)
        .in("status", ["awaiting_payment", "payment_pending", "reserved", "paid", "pending", "confirmed"]);

    if (isMissingCancelMetaColumns(updateError as PostgrestErrorLike | null)) {
        const fallback = await admin
            .from("orders")
            .update({
                status: "cancelled",
                cancelled_at: nowIso,
            })
            .eq("id", orderId)
            .eq("user_id", user.id)
            .in("status", ["awaiting_payment", "payment_pending", "reserved", "paid", "pending", "confirmed"]);
        updateError = fallback.error;
    }

    if (updateError) return NextResponse.json({error: updateError.message}, {status: 500});
    return NextResponse.json({ok: true}, {status: 200});
}
