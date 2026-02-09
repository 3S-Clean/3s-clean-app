import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {isCloudflareStreamConfigured} from "@/shared/lib/cloudflare/stream";

type VideoHistoryRow = {
    id: string;
    order_id: string;
    cloudflare_video_uid: string;
    status: string;
    title: string | null;
    duration_seconds: number | null;
    size_bytes: number | null;
    thumbnail_url: string | null;
    preview_url: string | null;
    hls_url: string | null;
    dash_url: string | null;
    recorded_at: string | null;
    ready_at: string | null;
    expires_at: string;
    deleted_at: string | null;
    created_at: string;
    orders: Array<{
        id: string;
        service_type: string;
        scheduled_date: string;
        scheduled_time: string;
        status: string;
        total_price: number | string;
    }>;
};

type HistoryItem = {
    id: string;
    orderId: string;
    videoUid: string;
    status: string;
    title: string | null;
    durationSeconds: number | null;
    sizeBytes: number | null;
    thumbnailUrl: string | null;
    previewUrl: string | null;
    hlsUrl: string | null;
    dashUrl: string | null;
    recordedAt: string | null;
    readyAt: string | null;
    expiresAt: string;
    createdAt: string;
    order: {
        id: string;
        serviceType: string;
        scheduledDate: string;
        scheduledTime: string;
        status: string;
        totalPrice: number | string;
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
    const nowIso = new Date().toISOString();
    const {data, error} = await admin
        .from("order_video_recordings")
        .select(`
            id,
            order_id,
            cloudflare_video_uid,
            status,
            title,
            duration_seconds,
            size_bytes,
            thumbnail_url,
            preview_url,
            hls_url,
            dash_url,
            recorded_at,
            ready_at,
            expires_at,
            deleted_at,
            created_at,
            orders!inner (
                id,
                user_id,
                service_type,
                scheduled_date,
                scheduled_time,
                status,
                total_price
            )
        `)
        .is("deleted_at", null)
        .gt("expires_at", nowIso)
        .eq("orders.user_id", user.id)
        .order("recorded_at", {ascending: false, nullsFirst: false})
        .order("created_at", {ascending: false});

    if (error) {
        return NextResponse.json({error: error.message || "Failed to load video history"}, {status: 500});
    }

    const rows = (data ?? []) as unknown as VideoHistoryRow[];
    const items: HistoryItem[] = rows.map((row) => {
        const order = Array.isArray(row.orders) ? (row.orders[0] ?? null) : null;
        return {
            id: row.id,
            orderId: row.order_id,
            videoUid: row.cloudflare_video_uid,
            status: row.status,
            title: row.title,
            durationSeconds: row.duration_seconds,
            sizeBytes: row.size_bytes,
            thumbnailUrl: row.thumbnail_url,
            previewUrl: row.preview_url,
            hlsUrl: row.hls_url,
            dashUrl: row.dash_url,
            recordedAt: row.recorded_at,
            readyAt: row.ready_at,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            order: order
                ? {
                    id: order.id,
                    serviceType: order.service_type,
                    scheduledDate: order.scheduled_date,
                    scheduledTime: order.scheduled_time,
                    status: order.status,
                    totalPrice: order.total_price,
                }
                : null,
        };
    });

    return NextResponse.json(
        {
            configured: isCloudflareStreamConfigured(),
            items,
        },
        {status: 200}
    );
}
