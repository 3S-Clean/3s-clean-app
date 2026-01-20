import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/* =========================
   Types
========================= */

type LinkOrderBody = {
    pendingToken?: unknown;
};

type OrderRow = {
    id: string;
    user_id: string | null;

    customer_first_name: string | null;
    customer_last_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    customer_postal_code: string | null;
    customer_city: string | null;
    customer_country: string | null;
    customer_notes: string | null;
};

/* =========================
   Helpers
========================= */

function isFilled(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}

function isOrderRow(v: unknown): v is OrderRow {
    if (!v || typeof v !== "object") return false;
    const o = v as Record<string, unknown>;

    const s = (x: unknown) => typeof x === "string";
    const sn = (x: unknown) => x === null || typeof x === "string";

    return (
        s(o.id) &&
        (o.user_id === null || s(o.user_id)) &&
        sn(o.customer_first_name) &&
        sn(o.customer_last_name) &&
        sn(o.customer_email) &&
        sn(o.customer_phone) &&
        sn(o.customer_address) &&
        sn(o.customer_postal_code) &&
        sn(o.customer_city) &&
        sn(o.customer_country) &&
        sn(o.customer_notes)
    );
}

/* =========================
   Route
========================= */

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

    // 🔐 authenticated user
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // 1️⃣ Find order by pending_token
    const { data: found, error: findErr } = await admin
        .from("orders")
        .select(
            `
        id,
        user_id,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_postal_code,
        customer_city,
        customer_country,
        customer_notes
      `
        )
        .eq("pending_token", pendingToken)
        .maybeSingle();

    if (findErr) {
        console.error("link-order: find error", findErr);
        return NextResponse.json({ error: "Could not link booking" }, { status: 500 });
    }

    if (!found) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isOrderRow(found)) {
        console.error("link-order: invalid order shape", found);
        return NextResponse.json({ error: "Could not link booking" }, { status: 500 });
    }

    const order = found;

    // already linked to another user
    if (order.user_id && order.user_id !== user.id) {
        return NextResponse.json(
            { error: "Order already linked to another user" },
            { status: 409 }
        );
    }

    // 2️⃣ Link order → user + clear pending_token
    const { data: updated, error: updErr } = await admin
        .from("orders")
        .update({
            user_id: user.id,
            pending_token: null,
        })
        .eq("id", order.id)
        .select("id")
        .single();

    if (updErr) {
        console.error("link-order: update error", updErr);
        return NextResponse.json({ error: "Could not link booking" }, { status: 500 });
    }

    // 3️⃣ Soft-fill profile (ONLY missing fields)
    try {
        const { data: profile } = await admin
            .from("profiles")
            .select(
                "id, first_name, last_name, email, phone, address, postal_code, city, country, notes"
            )
            .eq("id", user.id)
            .maybeSingle();

        const patch: Record<string, string> = {};

        if (!isFilled(profile?.first_name) && isFilled(order.customer_first_name))
            patch.first_name = order.customer_first_name.trim();

        if (!isFilled(profile?.last_name) && isFilled(order.customer_last_name))
            patch.last_name = order.customer_last_name.trim();

        if (!isFilled(profile?.email) && isFilled(order.customer_email))
            patch.email = order.customer_email.trim();

        if (!isFilled(profile?.phone) && isFilled(order.customer_phone))
            patch.phone = order.customer_phone.trim();

        if (!isFilled(profile?.address) && isFilled(order.customer_address))
            patch.address = order.customer_address.trim();

        if (!isFilled(profile?.postal_code) && isFilled(order.customer_postal_code))
            patch.postal_code = order.customer_postal_code.trim();

        if (!isFilled(profile?.city) && isFilled(order.customer_city))
            patch.city = order.customer_city.trim();

        if (!isFilled(profile?.country) && isFilled(order.customer_country))
            patch.country = order.customer_country.trim();

        if (!isFilled(profile?.notes) && isFilled(order.customer_notes))
            patch.notes = order.customer_notes.trim();

        if (Object.keys(patch).length > 0) {
            const { error: profErr } = await admin
                .from("profiles")
                .update(patch)
                .eq("id", user.id);

            if (profErr) {
                console.error("link-order: profile patch error", profErr);
            }
        }
    } catch (e) {
        console.error("link-order: profile patch exception", e);
        // intentionally silent — linking order is more important
    }

    return NextResponse.json(
        { orderId: String(updated.id) },
        { status: 200 }
    );
}