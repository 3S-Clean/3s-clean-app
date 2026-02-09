import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";

export async function POST(req: Request) {
    const {postcode} = await req.json();
    const pc = String(postcode || "").trim();

    if (pc.length !== 5) return NextResponse.json({available: false}, {status: 200});

    const supabase = await createSupabaseServerClient();

    const {data, error} = await supabase
        .from("service_areas")
        .select("postcode")
        .eq("postcode", pc)
        .eq("active", true)
        .maybeSingle();

    if (error) return NextResponse.json({error: error.message}, {status: 500});

    return NextResponse.json({available: !!data}, {status: 200});
}