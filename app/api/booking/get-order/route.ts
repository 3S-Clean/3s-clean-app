import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    isAwaitingPaymentExpired,
    normalizeDisplayStatus,
} from "@/shared/lib/orders/lifecycle";

type Body = { orderId?: unknown };
type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};
type OrderRow = {
    id: string;
    status: string | null;
    created_at: string | null;
    payment_due_at?: string | null;
    [key: string]: unknown;
};

function isMissingPaymentDueColumn(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && joined.includes("payment_due_at");
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
    const primaryRes = await admin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();
    let orderRow = primaryRes.data as OrderRow | null;
    let orderError = primaryRes.error as PostgrestErrorLike | null;

    if (isMissingPaymentDueColumn(orderError)) {
        const fallbackRes = await admin
            .from("orders")
            .select(`
                id,
                user_id,
                pending_token,
                status,
                service_type,
                apartment_size,
                people_count,
                has_pets,
                has_kids,
                has_allergies,
                allergy_note,
                extras,
                base_price,
                extras_price,
                total_price,
                estimated_hours,
                customer_first_name,
                customer_last_name,
                customer_email,
                customer_phone,
                customer_address,
                customer_postal_code,
                customer_city,
                customer_country,
                customer_notes,
                legal_terms_read,
                legal_privacy_read,
                legal_accepted,
                legal_accepted_at,
                legal_version,
                scheduled_date,
                scheduled_time,
                created_at,
                updated_at,
                confirmed_at,
                completed_at,
                cancelled_at,
                confirmation_sent_at,
                reminder_sent_at
            `)
            .eq("id", orderId)
            .eq("user_id", user.id)
            .maybeSingle();
        orderRow = fallbackRes.data as OrderRow | null;
        orderError = fallbackRes.error as PostgrestErrorLike | null;
    }
    if (orderError) {
        return NextResponse.json({error: orderError.message ?? "Failed to load order"}, {status: 500});
    }
    if (!orderRow) return NextResponse.json({error: "Order not found"}, {status: 404});

    const nowMs = Date.now();
    if (isAwaitingPaymentExpired(orderRow, nowMs)) {
        await admin
            .from("orders")
            .update({
                status: "expired",
            })
            .eq("id", orderRow.id)
            .in("status", ["awaiting_payment", "pending"]);
        orderRow = {
            ...orderRow,
            status: "expired",
        };
    }

    return NextResponse.json(
        {
            order: {
                ...orderRow,
                status: normalizeDisplayStatus(orderRow, nowMs),
            },
        },
        {status: 200}
    );
}
