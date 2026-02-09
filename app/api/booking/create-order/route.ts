import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    isLegalConsentComplete,
    LEGAL_VERSION,
} from "@/shared/lib/legal/consent";

type CreateOrderBody = {
    orderData?: unknown;
    [k: string]: unknown;
};

type OrderPayload = Record<string, unknown>;
type SlotRow = {
    id: string;
    scheduled_time: string | null;
    estimated_hours: number | null;
    status: string | null;
    created_at: string | null;
};

type LegalConsentPayload = {
    termsRead: boolean;
    privacyRead: boolean;
    accepted: boolean;
    acceptedAt: string;
    version: string;
};

function s(v: unknown) {
    return String(v ?? "").trim();
}

function omitServerManagedFields(order: OrderPayload): OrderPayload {
    const blocked = new Set(["user_id", "pending_token", "status", "id", "created_at", "updated_at"]);
    return Object.fromEntries(Object.entries(order).filter(([key]) => !blocked.has(key)));
}

const PENDING_HOLD_MS = 30 * 60 * 1000;

function parseTimeToMinutes(v: unknown) {
    const raw = s(v);
    const m = raw.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isInteger(h) || !Number.isInteger(mm) || h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h * 60 + mm;
}

function parseDurationMinutes(v: unknown) {
    const hours = Number(v);
    if (!Number.isFinite(hours) || hours <= 0) return 0;
    return Math.round(hours * 60);
}

function readLegalConsent(order: OrderPayload): LegalConsentPayload | null {
    const termsRead = order.legal_terms_read === true;
    const privacyRead = order.legal_privacy_read === true;
    const accepted = order.legal_accepted === true;
    const acceptedAt = s(order.legal_accepted_at);
    const version = s(order.legal_version) || LEGAL_VERSION;

    if (
        !isLegalConsentComplete({
            termsRead,
            privacyRead,
            accepted,
            acceptedAt,
            version,
        })
    ) {
        return null;
    }

    return {termsRead, privacyRead, accepted, acceptedAt, version};
}

function isBlockingStatus(row: SlotRow, nowMs: number) {
    if (row.status === "confirmed" || row.status === "in_progress") return true;
    if (row.status !== "pending") return false;

    const createdAt = row.created_at ? Date.parse(row.created_at) : NaN;
    if (Number.isNaN(createdAt)) return false;
    return nowMs - createdAt <= PENDING_HOLD_MS;
}

export async function POST(req: Request) {
    let body: CreateOrderBody = {};
    try {
        body = (await req.json()) as CreateOrderBody;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }
    const orderDataRaw = (body?.orderData ?? body) as unknown;
    if (!orderDataRaw || typeof orderDataRaw !== "object") {
        return NextResponse.json({error: "Missing order data"}, {status: 400});
    }
    const orderData = orderDataRaw as OrderPayload;
    const required = [
        "service_type",
        "apartment_size",
        "people_count",
        "customer_first_name",
        "customer_email",
        "customer_phone",
        "customer_address",
        "customer_postal_code",
        "customer_city",
        "customer_country",
        "scheduled_date",
        "scheduled_time",
        "total_price",
        "estimated_hours",
    ] as const;
    for (const k of required) {
        const v = orderData[k];
        if (v === null || v === undefined || String(v).trim() === "") {
            return NextResponse.json({error: `Missing field: ${k}`}, {status: 400});
        }
    }

    const legalConsent = readLegalConsent(orderData);
    if (!legalConsent) {
        return NextResponse.json(
            {error: "Missing or invalid legal consent (terms/privacy read + accepted)."},
            {status: 400}
        );
    }

    // кто залогинен (если есть)
    const supabase = await createSupabaseServerClient();
    const {
        data: {user},
    } = await supabase.auth.getUser();
    const pendingToken = crypto.randomUUID();
    const admin = createSupabaseAdminClient();
    const safe = omitServerManagedFields(orderData);

    const scheduledDate = s(orderData.scheduled_date);
    const startMin = parseTimeToMinutes(orderData.scheduled_time);
    const durationMin = parseDurationMinutes(orderData.estimated_hours);
    if (!scheduledDate || startMin === null || durationMin <= 0) {
        return NextResponse.json({error: "Invalid schedule values"}, {status: 400});
    }
    const endMin = startMin + durationMin;

    const {data: dayRows, error: dayRowsError} = await admin
        .from("orders")
        .select("id, scheduled_time, estimated_hours, status, created_at")
        .eq("scheduled_date", scheduledDate)
        .in("status", ["pending", "confirmed", "in_progress"]);

    if (dayRowsError) {
        return NextResponse.json({error: dayRowsError.message}, {status: 500});
    }

    const nowMs = Date.now();
    const conflict = ((dayRows ?? []) as SlotRow[]).some((row) => {
        if (!isBlockingStatus(row, nowMs)) return false;
        const rowStart = parseTimeToMinutes(row.scheduled_time);
        const rowDuration = parseDurationMinutes(row.estimated_hours);
        if (rowStart === null || rowDuration <= 0) return false;
        const rowEnd = rowStart + rowDuration;
        return startMin < rowEnd && endMin > rowStart;
    });

    if (conflict) {
        return NextResponse.json(
            {error: "Selected slot is no longer available. Please choose another time."},
            {status: 409}
        );
    }

    const payload = {
        ...safe,
        user_id: user?.id ?? null,
        pending_token: pendingToken,
        status: "pending",
    };

    const {data, error} = await admin.from("orders").insert(payload).select("id, pending_token").single();

    if (error || !data) {
        return NextResponse.json({error: error?.message ?? "Failed to create order"}, {status: 500});
    }

    // ✅ NEW: если user залогинен — подливаем данные в profile (только если пусто)
    if (user?.id) {
        try {
            const {data: profile} = await admin
                .from("profiles")
                .select("id, first_name, last_name, phone, email, address, postal_code, city, country")
                .eq("id", user.id)
                .maybeSingle();
            const patch: Record<string, string> = {};
            const cf = s(orderData.customer_first_name);
            const cl = s(orderData.customer_last_name);
            const ce = s(orderData.customer_email);
            const cp = s(orderData.customer_phone);
            const ca = s(orderData.customer_address);
            const cpc = s(orderData.customer_postal_code);
            const ccity = s(orderData.customer_city);
            const ccountry = s(orderData.customer_country);
            if (cf && s(profile?.first_name) !== cf) patch.first_name = cf;
            if (cl && s(profile?.last_name) !== cl) patch.last_name = cl;
            if (cp && s(profile?.phone) !== cp) patch.phone = cp;
            if (ce && s(profile?.email) !== ce) patch.email = ce;
            if (ca && s(profile?.address) !== ca) patch.address = ca;
            if (cpc && s(profile?.postal_code) !== cpc) patch.postal_code = cpc;
            if (ccity && s(profile?.city) !== ccity) patch.city = ccity;
            if (ccountry && s(profile?.country) !== ccountry) patch.country = ccountry;
            if (Object.keys(patch).length > 0) {
                await admin.from("profiles").upsert({id: user.id, ...patch}, {onConflict: "id"});
            }
        } catch (e) {
            // не ломаем заказ из-за профиля
            console.error("profile autofill failed", e);
        }
    }

    return NextResponse.json(
        {
            orderId: String(data.id),
            pendingToken: String(data.pending_token),
        },
        {status: 200}
    );
}
