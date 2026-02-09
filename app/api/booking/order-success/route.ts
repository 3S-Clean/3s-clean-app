import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";

export async function POST(req: Request) {
    const {token} = await req.json();
    const supabase = await createSupabaseServerClient();

    const {data, error} = await supabase.from("orders").select(
        "service_type, scheduled_date, scheduled_time, estimated_hours, customer_address, customer_postal_code, total_price"
    ).eq("pending_token", String(token)).maybeSingle();

    if (error) return NextResponse.json({error: error.message}, {status: 500});

    // возвращаем как {data: row|null} — как ты уже используешь
    return NextResponse.json({data: data ?? null}, {status: 200});
}