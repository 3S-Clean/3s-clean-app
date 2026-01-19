import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Body = { orderId?: string; pendingToken?: string };

function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: Request) {
    let body: Body;
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const orderId = (body.orderId || "").trim();
    const pendingToken = (body.pendingToken || "").trim();

    if (!orderId && !pendingToken) {
        return NextResponse.json({ error: "Missing orderId or pendingToken" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // ⚠️ Отдаём ТОЛЬКО безопасные поля
    const selectSafe =
        "id, service_type, scheduled_date, scheduled_time, estimated_hours, total_price, status, created_at";

    let q = supabase.from("orders").select(selectSafe).limit(1);

    if (orderId) {
        if (!isUuid(orderId)) return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
        q = q.eq("id", orderId);
    } else {
        if (!isUuid(pendingToken)) return NextResponse.json({ error: "Invalid pendingToken" }, { status: 400 });
        q = q.eq("pending_token", pendingToken);
    }

    const { data, error } = await q.maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ order: data }, { status: 200 });
}