import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LinkOrderBody = {
    pendingToken?: unknown;
};

function isFilled(v: unknown) {
    return typeof v === "string" && v.trim().length > 0;
}

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

    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // 1) find order by pending_token (grab customer fields too)
    const { data: order, error: findErr } = await admin
        .from("orders")
        .select(
            "id, user_id, customer_first_name, customer_last_name, customer_phone, customer_email, customer_address, customer_postal_code"
        )
        .eq("pending_token", pendingToken)
        .maybeSingle();

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // already linked to another user
    if (order.user_id && order.user_id !== user.id) {
        return NextResponse.json({ error: "Order already linked to another user" }, { status: 409 });
    }

    // 2) link order + clear pending_token
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

    // 3) soft-fill profile from order (ONLY missing fields)
    try {
        const { data: profile, error: pErr } = await admin
            .from("profiles")
            .select("id, first_name, last_name, phone, email, address, postal_code")
            .eq("id", user.id)
            .maybeSingle();

        if (!pErr) {
            const patch: Record<string, string> = {};

            if (!isFilled(profile?.first_name) && isFilled(order.customer_first_name))
                patch.first_name = String(order.customer_first_name).trim();

            if (!isFilled(profile?.last_name) && isFilled(order.customer_last_name))
                patch.last_name = String(order.customer_last_name).trim();

            if (!isFilled(profile?.phone) && isFilled(order.customer_phone))
                patch.phone = String(order.customer_phone).trim();

            if (!isFilled(profile?.email) && isFilled(order.customer_email))
                patch.email = String(order.customer_email).trim();

            if (!isFilled(profile?.address) && isFilled(order.customer_address))
                patch.address = String(order.customer_address).trim();

            if (!isFilled(profile?.postal_code) && isFilled(order.customer_postal_code))
                patch.postal_code = String(order.customer_postal_code).trim();

            if (Object.keys(patch).length > 0) {
                await admin.from("profiles").update(patch).eq("id", user.id);
            }
        }
    } catch {
        // тихо — линк заказа важнее
    }

    return NextResponse.json({ orderId: String(updated.id) }, { status: 200 });
}