import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Body = { startDate?: string; endDate?: string };

export async function POST(req: Request) {
    let body: Body = {};
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json([], { status: 200 });
    }

    const { startDate, endDate } = body;

    if (!startDate || !endDate) return NextResponse.json([], { status: 200 });

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("scheduled_date, scheduled_time, estimated_hours")
        .gte("scheduled_date", String(startDate))
        .lte("scheduled_date", String(endDate))
        .in("status", ["pending", "confirmed"]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data ?? [], { status: 200 });
}