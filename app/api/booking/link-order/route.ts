import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LinkOrderBody = {
    pendingToken?: unknown;
};

export async function POST(req: Request) {
    let body: LinkOrderBody = {};
    try {
        body = (await req.json()) as LinkOrderBody;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const pendingToken = String(body?.pendingToken ?? "").trim();
    if (!pendingToken) {
        return NextResponse.json({ error: "Missing pendingToken" }, { status: 400 });
    }

    // кто залогинен
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // admin (обходит RLS) — чтобы можно было привязать гостевой заказ
    const admin = createSupabaseAdminClient();

    // 1) находим заказ по pending_token
    const { data: order, error: findErr } = await admin
        .from("orders")
        .select("id, user_id")
        .eq("pending_token", pendingToken)
        .maybeSingle();

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // если уже привязан — просто вернём orderId (идемпотентно)
    if (order.user_id && order.user_id !== user.id) {
        return NextResponse.json({ error: "Order already linked to another user" }, { status: 409 });
    }

    // 2) линкуем + чистим pending_token
    const { data: updated, error: updErr } = await admin
        .from("orders")
        .update({
            user_id: user.id,
            pending_token: null,
        })
        .eq("id", order.id)
        .select("id")
        .single();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ orderId: String(updated.id) }, { status: 200 });
}