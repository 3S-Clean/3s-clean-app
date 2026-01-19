import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateOrderBody = {
    // поддержим оба формата:
    // 1) { orderData: {...} }
    // 2) {...} (плоский payload)
    orderData?: unknown;
    [k: string]: unknown;
};

type OrderPayload = Record<string, unknown>;

export async function POST(req: Request) {
    let body: CreateOrderBody = {};
    try {
        body = (await req.json()) as CreateOrderBody;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const orderDataRaw = (body?.orderData ?? body) as unknown;
    if (!orderDataRaw || typeof orderDataRaw !== "object") {
        return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    const orderData = orderDataRaw as OrderPayload;

    // обязательные поля (минимум, чтобы не писать мусор)
    const required = [
        "service_type",
        "apartment_size",
        "people_count",
        "customer_first_name",
        "customer_email",
        "customer_phone",
        "customer_address",
        "customer_postal_code",
        "scheduled_date",
        "scheduled_time",
        "total_price",
        "estimated_hours",
    ] as const;

    for (const k of required) {
        const v = orderData[k];
        if (v === null || v === undefined || String(v).trim() === "") {
            return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
        }
    }

    // кто залогинен (если есть)
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // pending token ВСЕГДА
    const pendingToken = crypto.randomUUID();

    // админ-клиент, чтобы вставка работала и для гостя (обходит RLS)
    const admin = createSupabaseAdminClient();

    // защита от подмены важных полей
    const { user_id: _ignoreUserId, pending_token: _ignorePending, status: _ignoreStatus, ...safe } = orderData;

    const payload = {
        ...safe,
        user_id: user?.id ?? null,
        pending_token: pendingToken,
        status: "pending",
    };

    const { data, error } = await admin
        .from("orders")
        .insert(payload)
        .select("id, pending_token")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(
        {
            orderId: String(data.id),
            pendingToken: String(data.pending_token),
        },
        { status: 200 }
    );
}