import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";

type Body = {
    orderId?: unknown;
};

export async function POST(req: Request) {
    let body: Body = {};
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const orderId = String(body.orderId ?? "").trim();
    if (!orderId) return NextResponse.json({error: "Missing orderId"}, {status: 400});

    const supabase = await createSupabaseServerClient();
    const {
        data: {user},
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const admin = createSupabaseAdminClient();
    const {data, error} = await admin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) return NextResponse.json({error: error.message}, {status: 500});
    if (!data) return NextResponse.json({error: "Order not found"}, {status: 404});

    // Base payload for future PDF generation worker/service.
    return NextResponse.json(
        {
            ready: false,
            message: "PDF generation is not enabled yet.",
            payload: {
                order: data,
                generated_at: new Date().toISOString(),
            },
        },
        {status: 200}
    );
}
