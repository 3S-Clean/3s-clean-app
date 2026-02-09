// app/api/booking/get-order-public/route.ts
import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    isAwaitingPaymentExpired,
    normalizeDisplayStatus,
} from "@/shared/lib/orders/lifecycle";

type Body = { orderId?: string; pendingToken?: string };
type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};
type OrderPublicRow = {
    id: string;
    status: string | null;
    created_at: string | null;
    payment_due_at?: string | null;
    [key: string]: unknown;
};

function isMissingPaymentDueColumn(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && (joined.includes("payment_due_at") || joined.includes("paid_at"));
}

function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: Request) {
    let body: Body;
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const orderId = (body.orderId || "").trim();
    const pendingToken = (body.pendingToken || "").trim();

    if (!orderId && !pendingToken) {
        return NextResponse.json({error: "Missing orderId or pendingToken"}, {status: 400});
    }

    const supabase = createSupabaseAdminClient();

    // ✅ safe fields для success page (то, что ты хочешь показывать в карточке)
    const selectSafe = `
    id,
    status,
    payment_due_at,
    paid_at,
    service_type,
    apartment_size,
    people_count,
    extras,
    base_price,
    extras_price,
    scheduled_date,
    scheduled_time,
    estimated_hours,
    total_price,
    created_at,

    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    customer_address,
    customer_postal_code,
    customer_city,
    customer_country,
    customer_notes
  `;
    const selectFallback = selectSafe.replace("    payment_due_at,\n", "").replace("    paid_at,\n", "");

    let q = supabase.from("orders").select(selectSafe).limit(1);

    if (orderId) {
        if (!isUuid(orderId)) return NextResponse.json({error: "Invalid orderId"}, {status: 400});
        q = q.eq("id", orderId);
    } else {
        if (!isUuid(pendingToken)) return NextResponse.json({error: "Invalid pendingToken"}, {status: 400});
        q = q.eq("pending_token", pendingToken);
    }

    const primaryRes = await q.maybeSingle();
    let orderRow = primaryRes.data as OrderPublicRow | null;
    let orderError = primaryRes.error as PostgrestErrorLike | null;
    if (isMissingPaymentDueColumn(orderError)) {
        let qFallback = supabase.from("orders").select(selectFallback).limit(1);
        if (orderId) qFallback = qFallback.eq("id", orderId);
        else qFallback = qFallback.eq("pending_token", pendingToken);
        const fallbackRes = await qFallback.maybeSingle();
        orderRow = fallbackRes.data as OrderPublicRow | null;
        orderError = fallbackRes.error as PostgrestErrorLike | null;
    }

    if (orderError) {
        return NextResponse.json({error: orderError.message ?? "Failed to load order"}, {status: 500});
    }
    if (!orderRow) return NextResponse.json({error: "Order not found"}, {status: 404});

    const nowMs = Date.now();
    if (isAwaitingPaymentExpired(orderRow, nowMs)) {
        await supabase
            .from("orders")
            .update({
                status: "cancelled",
                cancelled_at: new Date(nowMs).toISOString(),
            })
            .eq("id", orderRow.id)
            .in("status", ["reserved", "awaiting_payment", "payment_pending", "pending"]);
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
