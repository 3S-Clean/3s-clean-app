import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const { email, postcode } = await req.json();

    const em = String(email || "").trim();
    const pc = String(postcode || "").trim();

    if (!em.includes("@") || pc.length !== 5) {
        return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("notify_requests").insert({ email: em, postcode: pc });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true }, { status: 200 });
}