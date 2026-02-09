import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {deleteCloudflareVideo, isCloudflareStreamConfigured} from "@/shared/lib/cloudflare/stream";

type ExpiredRecordingRow = {
    id: string;
    cloudflare_video_uid: string;
    status: string;
    expires_at: string;
};

function readCleanupSecret(req: Request) {
    const direct = req.headers.get("x-video-cleanup-secret")?.trim();
    if (direct) return direct;
    const auth = req.headers.get("authorization")?.trim() ?? "";
    const bearerPrefix = "bearer ";
    if (auth.toLowerCase().startsWith(bearerPrefix)) {
        return auth.slice(bearerPrefix.length).trim();
    }
    return "";
}

function isNotFoundError(message: string) {
    const text = message.toLowerCase();
    return text.includes("not found") || text.includes("does not exist");
}

async function runCleanup(req: Request) {
    const expectedSecret = String(
        process.env.VIDEO_RETENTION_CRON_SECRET ?? process.env.CRON_SECRET ?? ""
    ).trim();
    if (!expectedSecret) {
        return NextResponse.json(
            {error: "VIDEO_RETENTION_CRON_SECRET (or CRON_SECRET) is not configured"},
            {status: 500}
        );
    }

    const providedSecret = readCleanupSecret(req);
    if (!providedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    if (!isCloudflareStreamConfigured()) {
        return NextResponse.json(
            {error: "Cloudflare Stream is not configured"},
            {status: 500}
        );
    }

    const admin = createSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const {data, error} = await admin
        .from("order_video_recordings")
        .select("id,cloudflare_video_uid,status,expires_at")
        .is("deleted_at", null)
        .lte("expires_at", nowIso)
        .limit(200);

    if (error) {
        return NextResponse.json({error: error.message || "Failed to load expired recordings"}, {status: 500});
    }

    const rows = (data ?? []) as ExpiredRecordingRow[];
    if (rows.length === 0) {
        return NextResponse.json({ok: true, total: 0, deleted: 0, failed: 0}, {status: 200});
    }

    let deleted = 0;
    let failed = 0;
    const failures: Array<{id: string; reason: string}> = [];

    for (const row of rows) {
        let deleteReason = "retention_7d";
        let canMarkDeleted = true;

        try {
            await deleteCloudflareVideo(row.cloudflare_video_uid);
        } catch (errorLike) {
            const reason = errorLike instanceof Error ? errorLike.message : "Cloudflare delete failed";
            if (isNotFoundError(reason)) {
                deleteReason = "already_deleted_upstream";
            } else {
                canMarkDeleted = false;
                failed += 1;
                failures.push({id: row.id, reason});
            }
        }

        if (!canMarkDeleted) continue;

        const {error: markError} = await admin
            .from("order_video_recordings")
            .update({
                status: "deleted",
                deleted_at: nowIso,
                delete_reason: deleteReason,
            })
            .eq("id", row.id);

        if (markError) {
            failed += 1;
            failures.push({id: row.id, reason: markError.message || "Failed to mark as deleted"});
            continue;
        }

        deleted += 1;
    }

    return NextResponse.json(
        {
            ok: failed === 0,
            total: rows.length,
            deleted,
            failed,
            failures,
        },
        {status: failed === 0 ? 200 : 207}
    );
}

export async function POST(req: Request) {
    return runCleanup(req);
}

export async function GET(req: Request) {
    return runCleanup(req);
}
