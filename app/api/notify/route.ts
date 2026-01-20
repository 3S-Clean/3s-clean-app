// app/api/booking/notify/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const NotifySchema = z.object({
    email: z.string().email(),
    postcode: z.string().length(5),
});

export async function POST(req: Request) {
    const parsed = NotifySchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json({ success: false }, { status: 400 });
    }

    const { email, postcode } = parsed.data;

    const admin = createSupabaseAdminClient();

    const { error } = await admin
        .from("notify_requests")
        .insert({ email, postal_code: postcode });

    if (error) {
        console.error("notify insert error", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}