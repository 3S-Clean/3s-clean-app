import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    getCloudflareVideo,
    hasCloudflareStreamWebhookSecret,
    isCloudflareStreamConfigured,
    verifyCloudflareStreamWebhookRequest,
    type CloudflareStreamVideo,
} from "@/shared/lib/cloudflare/stream";

type Json = Record<string, unknown>;

type LiveInputMapping = {
    id: string;
    order_id: string;
};

function isObj(v: unknown): v is Json {
    return !!v && typeof v === "object";
}

function asText(v: unknown) {
    return String(v ?? "").trim();
}

function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function getPath(obj: unknown, path: string[]) {
    let cur: unknown = obj;
    for (const key of path) {
        if (!isObj(cur)) return undefined;
        cur = cur[key];
    }
    return cur;
}

function firstText(obj: unknown, paths: string[][]) {
    for (const path of paths) {
        const raw = getPath(obj, path);
        const text = asText(raw);
        if (text) return text;
    }
    return "";
}

function readWebhookEventType(payload: unknown) {
    return firstText(payload, [
        ["event"],
        ["eventType"],
        ["notification_type"],
        ["type"],
        ["status", "state"],
    ]).toLowerCase();
}

function readVideoUid(payload: unknown) {
    return firstText(payload, [
        ["uid"],
        ["video_uid"],
        ["videoUid"],
        ["video", "uid"],
        ["result", "uid"],
        ["data", "uid"],
    ]);
}

function readLiveInputId(payload: unknown) {
    return firstText(payload, [
        ["liveInput"],
        ["live_input"],
        ["liveInputId"],
        ["video", "liveInput"],
        ["result", "liveInput"],
        ["data", "liveInput"],
    ]);
}

function readMeta(payload: unknown) {
    const candidates = [
        getPath(payload, ["meta"]),
        getPath(payload, ["video", "meta"]),
        getPath(payload, ["result", "meta"]),
        getPath(payload, ["data", "meta"]),
    ];
    for (const candidate of candidates) {
        if (isObj(candidate)) return candidate;
    }
    return {} as Json;
}

function toIsoOrNull(v: unknown) {
    const raw = asText(v);
    if (!raw) return null;
    const ms = Date.parse(raw);
    if (Number.isNaN(ms)) return null;
    return new Date(ms).toISOString();
}

async function resolveLiveInputMapping(admin: ReturnType<typeof createSupabaseAdminClient>, liveInputId: string) {
    if (!liveInputId) return null;
    const {data, error} = await admin
        .from("order_stream_live_inputs")
        .select("id,order_id")
        .eq("cloudflare_live_input_id", liveInputId)
        .maybeSingle();
    if (error || !data) return null;
    return data as LiveInputMapping;
}

function retentionExpiryIso(fromIso: string | null) {
    const fromMs = fromIso ? Date.parse(fromIso) : Date.now();
    const baseMs = Number.isNaN(fromMs) ? Date.now() : fromMs;
    return new Date(baseMs + 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function readVideoDetails(payload: Json, videoUid: string) {
    if (isCloudflareStreamConfigured()) {
        try {
            return await getCloudflareVideo(videoUid);
        } catch {
            // fallback to webhook payload only
        }
    }

    const statusState = asText(getPath(payload, ["status", "state"])) || asText(getPath(payload, ["status"]));
    const readyToStream = getPath(payload, ["readyToStream"]) === true;
    return {
        uid: videoUid,
        status: statusState ? {state: statusState} : undefined,
        readyToStream,
        duration: Number(getPath(payload, ["duration"]) ?? 0) || undefined,
        size: Number(getPath(payload, ["size"]) ?? 0) || undefined,
        created: asText(getPath(payload, ["created"])) || undefined,
        modified: asText(getPath(payload, ["modified"])) || undefined,
        thumbnail: asText(getPath(payload, ["thumbnail"])) || undefined,
        preview: asText(getPath(payload, ["preview"])) || undefined,
        playback: {
            hls: asText(getPath(payload, ["playback", "hls"])) || undefined,
            dash: asText(getPath(payload, ["playback", "dash"])) || undefined,
        },
        liveInput: readLiveInputId(payload) || undefined,
        meta: readMeta(payload),
    } as CloudflareStreamVideo;
}

export async function POST(req: Request) {
    if (!hasCloudflareStreamWebhookSecret()) {
        return NextResponse.json(
            {error: "CLOUDFLARE_STREAM_WEBHOOK_SECRET is not configured"},
            {status: 500}
        );
    }

    const rawBody = await req.text();
    if (!verifyCloudflareStreamWebhookRequest(req, rawBody)) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    let payload: Json = {};
    try {
        payload = JSON.parse(rawBody) as Json;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const admin = createSupabaseAdminClient();
    const eventType = readWebhookEventType(payload) || "unknown";
    const eventVideoUid = readVideoUid(payload);
    const eventLiveInputId = readLiveInputId(payload);
    const nowIso = new Date().toISOString();

    const {data: eventLog} = await admin
        .from("stream_webhook_events")
        .insert({
            event_type: eventType,
            cloudflare_video_uid: eventVideoUid || null,
            cloudflare_live_input_id: eventLiveInputId || null,
            payload,
        })
        .select("id")
        .maybeSingle();

    const eventId = (eventLog as {id: number} | null)?.id ?? null;
    const finish = async (processingError: string | null = null) => {
        if (!eventId) return;
        await admin
            .from("stream_webhook_events")
            .update({
                processed_at: new Date().toISOString(),
                processing_error: processingError,
            })
            .eq("id", eventId);
    };

    const eventTypeLc = eventType.toLowerCase();
    if (eventLiveInputId) {
        if (eventTypeLc.includes("connected")) {
            await admin
                .from("order_stream_live_inputs")
                .update({live_status: "live", started_at: nowIso, ended_at: null})
                .eq("cloudflare_live_input_id", eventLiveInputId);
        } else if (eventTypeLc.includes("disconnected") || eventTypeLc.includes("idle") || eventTypeLc.includes("ended")) {
            await admin
                .from("order_stream_live_inputs")
                .update({live_status: "ended", ended_at: nowIso})
                .eq("cloudflare_live_input_id", eventLiveInputId);
        } else if (eventTypeLc.includes("error")) {
            await admin
                .from("order_stream_live_inputs")
                .update({live_status: "error"})
                .eq("cloudflare_live_input_id", eventLiveInputId);
        }
    }

    if (!eventVideoUid) {
        await finish(null);
        return NextResponse.json({ok: true, skipped: "no_video_uid"}, {status: 202});
    }

    const video = await readVideoDetails(payload, eventVideoUid);
    const liveInputId = asText(video.liveInput) || eventLiveInputId;
    const meta = isObj(video.meta) ? video.meta : readMeta(payload);
    const metaOrderId = asText(meta.order_id ?? meta.orderId);

    let mapping = await resolveLiveInputMapping(admin, liveInputId);
    const resolvedOrderId = isUuid(metaOrderId) ? metaOrderId : (mapping?.order_id ?? "");
    if (!isUuid(resolvedOrderId)) {
        await finish("Unable to resolve order_id from webhook payload/meta");
        return NextResponse.json(
            {ok: false, error: "Unable to resolve order_id for video"},
            {status: 202}
        );
    }

    if (!mapping && liveInputId) {
        const {data: createdMapping} = await admin
            .from("order_stream_live_inputs")
            .upsert(
                {
                    order_id: resolvedOrderId,
                    cloudflare_live_input_id: liveInputId,
                    cloudflare_live_input_name: asText(meta.live_input_name) || null,
                },
                {onConflict: "order_id"}
            )
            .select("id,order_id")
            .maybeSingle();
        mapping = (createdMapping as LiveInputMapping | null) ?? null;
    }

    const statusState = asText(video.status?.state).toLowerCase();
    let recordingStatus = "processing";
    if (eventTypeLc.includes("deleted")) recordingStatus = "deleted";
    else if (statusState.includes("error") || eventTypeLc.includes("error")) recordingStatus = "error";
    else if (video.readyToStream || statusState === "ready") recordingStatus = "ready";

    const recordedAt = toIsoOrNull(video.created) ?? nowIso;
    const readyAt = recordingStatus === "ready" ? (toIsoOrNull(video.modified) ?? nowIso) : null;
    const deletedAt = recordingStatus === "deleted" ? nowIso : null;

    const patch: Record<string, unknown> = {
        order_id: resolvedOrderId,
        cloudflare_video_uid: video.uid,
        cloudflare_live_input_id: liveInputId || null,
        status: recordingStatus,
        title: asText(meta.title) || null,
        duration_seconds: Number(video.duration ?? 0) || null,
        size_bytes: Number(video.size ?? 0) || null,
        thumbnail_url: asText(video.thumbnail) || null,
        preview_url: asText(video.preview) || null,
        hls_url: asText(video.playback?.hls) || null,
        dash_url: asText(video.playback?.dash) || null,
        recorded_at: recordedAt,
        expires_at: retentionExpiryIso(recordedAt),
        raw_payload: {
            webhook: payload,
            video,
        },
    };
    if (mapping?.id) {
        patch.live_input_id = mapping.id;
    }
    if (readyAt) {
        patch.ready_at = readyAt;
    }
    if (deletedAt) {
        patch.deleted_at = deletedAt;
        patch.delete_reason = "cloudflare_deleted_event";
    }

    const {error: upsertError} = await admin
        .from("order_video_recordings")
        .upsert(patch, {onConflict: "cloudflare_video_uid"});

    if (upsertError) {
        await finish(upsertError.message || "Failed to upsert order_video_recordings");
        return NextResponse.json({error: upsertError.message}, {status: 500});
    }

    await finish(null);
    return NextResponse.json(
        {
            ok: true,
            eventType,
            videoUid: video.uid,
            orderId: resolvedOrderId,
        },
        {status: 200}
    );
}
