import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateOrderBody = {
    orderData?: unknown;
    [k: string]: unknown;
};

type OrderPayload = Record<string, unknown>;

function s(v: unknown) {
    return String(v ?? "").trim();
}
function isFilled(v: unknown) {
    return typeof v === "string" ? v.trim().length > 0 : s(v).length > 0;
}

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
        "customer_city",
	    "customer_country",
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
    const {
        user_id: _ignoreUserId,
        pending_token: _ignorePending,
        status: _ignoreStatus,
        id: _ignoreId,
        created_at: _ignoreCreatedAt,
        updated_at: _ignoreUpdatedAt,
        ...safe
    } = orderData;

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

    // ✅ NEW: если user залогинен — подливаем данные в profile (только если пусто)
    if (user?.id) {
        try {
            const { data: profile } = await admin
                .from("profiles")
                .select("id, first_name, last_name, phone, email, address, postal_code, city, country")
                .eq("id", user.id)
                .maybeSingle();

            const patch: Record<string, string> = {};

            const cf = s(orderData.customer_first_name);
            const cl = s(orderData.customer_last_name);
            const ce = s(orderData.customer_email);
            const cp = s(orderData.customer_phone);
            const ca = s(orderData.customer_address);
            const cpc = s(orderData.customer_postal_code);
            const ccity = s(orderData.customer_city);
            const ccountry = s(orderData.customer_country);

            if (!isFilled(profile?.first_name) && cf) patch.first_name = cf;
            if (!isFilled(profile?.last_name) && cl) patch.last_name = cl;

            if (!isFilled(profile?.phone) && cp) patch.phone = cp;
            if (!isFilled(profile?.email) && ce) patch.email = ce;

            if (!isFilled(profile?.address) && ca) patch.address = ca;
            if (!isFilled(profile?.postal_code) && cpc) patch.postal_code = cpc;

            if (!isFilled(profile?.city) && ccity) patch.city = ccity;
            if (!isFilled(profile?.country) && ccountry) patch.country = ccountry;

            if (Object.keys(patch).length > 0) {
                await admin.from("profiles").upsert({ id: user.id, ...patch }, { onConflict: "id" });
            }
        } catch (e) {
            // не ломаем заказ из-за профиля
            console.error("profile autofill failed", e);
        }
    }

    return NextResponse.json(
        {
            orderId: String(data.id),
            pendingToken: String(data.pending_token),
        },
        { status: 200 }
    );
}