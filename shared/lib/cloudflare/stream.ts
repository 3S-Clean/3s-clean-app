import {createHmac, timingSafeEqual} from "crypto";

type CloudflareError = {
    code?: number;
    message?: string;
};

type CloudflareEnvelope<T> = {
    success?: boolean;
    errors?: CloudflareError[];
    result?: T;
};

export type CloudflareStreamVideo = {
    uid: string;
    status?: {
        state?: string;
    };
    readyToStream?: boolean;
    duration?: number;
    size?: number;
    created?: string;
    modified?: string;
    thumbnail?: string;
    preview?: string;
    playback?: {
        hls?: string;
        dash?: string;
    };
    liveInput?: string;
    meta?: Record<string, unknown>;
};

function readCloudflareConfig() {
    return {
        accountId: String(process.env.CLOUDFLARE_ACCOUNT_ID ?? "").trim(),
        apiToken: String(process.env.CLOUDFLARE_STREAM_API_TOKEN ?? "").trim(),
        webhookSecret: String(process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET ?? "").trim(),
    };
}

function cloudflareBaseUrl(accountId: string) {
    return `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
}

function cloudflareAuthHeaders(apiToken: string) {
    return {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
    };
}

function isObj(v: unknown): v is Record<string, unknown> {
    return !!v && typeof v === "object";
}

function parseCloudflareError(payload: unknown, fallback: string) {
    if (!isObj(payload)) return fallback;
    const errors = Array.isArray(payload.errors) ? payload.errors : [];
    const first = errors.find((e) => isObj(e));
    if (!first) return fallback;
    const msg = String((first as Record<string, unknown>).message ?? "").trim();
    return msg || fallback;
}

async function cloudflareRequest<T>(path: string, init?: RequestInit) {
    const {accountId, apiToken} = readCloudflareConfig();
    if (!accountId || !apiToken) {
        throw new Error("Cloudflare Stream is not configured");
    }

    const res = await fetch(`${cloudflareBaseUrl(accountId)}${path}`, {
        ...init,
        headers: {
            ...cloudflareAuthHeaders(apiToken),
            ...(init?.headers ?? {}),
        },
        cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as CloudflareEnvelope<T> | null;
    if (!res.ok || !json?.success) {
        const fallback = `Cloudflare Stream API error (${res.status})`;
        throw new Error(parseCloudflareError(json, fallback));
    }

    return json.result as T;
}

export function isCloudflareStreamConfigured() {
    const {accountId, apiToken} = readCloudflareConfig();
    return Boolean(accountId && apiToken);
}

export function hasCloudflareStreamWebhookSecret() {
    const {webhookSecret} = readCloudflareConfig();
    return Boolean(webhookSecret);
}

export function verifyCloudflareStreamWebhookSecret(req: Request) {
    const {webhookSecret} = readCloudflareConfig();
    if (!webhookSecret) return false;

    const direct = req.headers.get("x-stream-webhook-secret")?.trim();
    if (direct) return direct === webhookSecret;

    const auth = req.headers.get("authorization")?.trim() ?? "";
    const bearerPrefix = "bearer ";
    if (auth.toLowerCase().startsWith(bearerPrefix)) {
        const token = auth.slice(bearerPrefix.length).trim();
        return token === webhookSecret;
    }

    return false;
}

function parseWebhookSignatureHeader(headerValue: string) {
    const parts = headerValue.split(",").map((part) => part.trim()).filter(Boolean);
    let time = "";
    let sig1 = "";
    for (const part of parts) {
        const [k, ...rest] = part.split("=");
        if (!k || rest.length === 0) continue;
        const value = rest.join("=").trim();
        if (k === "time") time = value;
        if (k === "sig1") sig1 = value;
    }
    return {time, sig1};
}

function secureCompareHex(expectedHex: string, actualHex: string) {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = Buffer.from(actualHex, "hex");
    if (expected.length === 0 || actual.length === 0) return false;
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
}

export function verifyCloudflareStreamWebhookSignature(rawBody: string, signatureHeader: string) {
    const {webhookSecret} = readCloudflareConfig();
    if (!webhookSecret) return false;

    const {time, sig1} = parseWebhookSignatureHeader(signatureHeader);
    if (!time || !sig1) return false;

    const timestampSec = Number(time);
    if (!Number.isFinite(timestampSec)) return false;

    // Reject stale signatures (5-minute window).
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestampSec) > 300) return false;

    const source = `${time}.${rawBody}`;
    const expected = createHmac("sha256", webhookSecret).update(source).digest("hex");
    return secureCompareHex(expected, sig1);
}

export function verifyCloudflareStreamWebhookRequest(req: Request, rawBody: string) {
    const signatureHeader = req.headers.get("webhook-signature")?.trim();
    if (signatureHeader) {
        return verifyCloudflareStreamWebhookSignature(rawBody, signatureHeader);
    }

    // Fallback for manual testing in curl.
    return verifyCloudflareStreamWebhookSecret(req);
}

export async function getCloudflareVideo(videoUid: string) {
    const uid = String(videoUid ?? "").trim();
    if (!uid) throw new Error("Missing Cloudflare video UID");
    const result = await cloudflareRequest<CloudflareStreamVideo | null>(`/${uid}`);
    if (!result) throw new Error("Cloudflare video was not returned");
    return result;
}

export async function deleteCloudflareVideo(videoUid: string) {
    const uid = String(videoUid ?? "").trim();
    if (!uid) throw new Error("Missing Cloudflare video UID");
    await cloudflareRequest<Record<string, never>>(`/${uid}`, {method: "DELETE"});
}
