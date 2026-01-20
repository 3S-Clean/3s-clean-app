import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Body = { email?: unknown; postalсode?: unknown };

function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export async function POST(req: Request) {
    let body: Body = {};
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = String(body.email ?? "").trim();
    const postalCode = String(body.postalсode ?? "").trim();

    if (!isEmail(email)) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!/^\d{5}$/.test(postalCode)) {
        return NextResponse.json({ error: "Invalid postal code" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("notify_requests").insert({
        email,
        postal_code: postalCode,
    });

    if (error) {
        // не палим пользователю детали
        console.error("notify insert error:", error);
        return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
}