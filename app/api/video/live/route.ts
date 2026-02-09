import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {isCloudflareStreamConfigured} from "@/shared/lib/cloudflare/stream";

type LiveInputRow = {
    id: string;
    order_id: string;
    cloudflare_live_input_id: string;
    cloudflare_live_input_name: string | null;
    live_status: string;
    hls_url: string | null;
    dash_url: string | null;
    started_at: string | null;
    ended_at: string | null;
    updated_at: string;
    orders: Array<{
        id: string;
        user_id: string | null;
        service_type: string;
        scheduled_date: string;
        scheduled_time: string;
        status: string;
    }>;
};

type LiveSession = {
    id: string;
    orderId: string;
    liveInputId: string;
    liveInputName: string | null;
    status: string;
    hlsUrl: string | null;
    dashUrl: string | null;
    startedAt: string | null;
    endedAt: string | null;
    updatedAt: string;
    order: {
        id: string;
        serviceType: string;
        scheduledDate: string;
        scheduledTime: string;
        status: string;
    } | null;
};

export async function GET() {
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
        .from("order_stream_live_inputs")
        .select(`
            id,
            order_id,
            cloudflare_live_input_id,
            cloudflare_live_input_name,
            live_status,
            hls_url,
            dash_url,
            started_at,
            ended_at,
            updated_at,
            orders!inner (
                id,
                user_id,
                service_type,
                scheduled_date,
                scheduled_time,
                status
            )
        `)
        .eq("orders.user_id", user.id)
        .order("updated_at", {ascending: false})
        .limit(1);

    if (error) {
        return NextResponse.json({error: error.message || "Failed to load live stream"}, {status: 500});
    }

    const row = ((data ?? [])[0] ?? null) as unknown as LiveInputRow | null;
    const order = row?.orders && Array.isArray(row.orders) ? (row.orders[0] ?? null) : null;
    const liveSession: LiveSession | null = row
        ? {
            id: row.id,
            orderId: row.order_id,
            liveInputId: row.cloudflare_live_input_id,
            liveInputName: row.cloudflare_live_input_name,
            status: row.live_status,
            hlsUrl: row.hls_url,
            dashUrl: row.dash_url,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            updatedAt: row.updated_at,
            order: order
                ? {
                    id: order.id,
                    serviceType: order.service_type,
                    scheduledDate: order.scheduled_date,
                    scheduledTime: order.scheduled_time,
                    status: order.status,
                }
                : null,
        }
        : null;

    return NextResponse.json(
        {
            configured: isCloudflareStreamConfigured(),
            liveSession,
        },
        {status: 200}
    );
}
