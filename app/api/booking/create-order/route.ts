import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    formatLegalConsentNote,
    isLegalConsentComplete,
    LEGAL_VERSION,
} from "@/shared/lib/legal/consent";

type CreateOrderBody = {
    orderData?: unknown;
    [k: string]: unknown;
};

type OrderPayload = Record<string, unknown>;
type PostgrestErrorLike = {code?: string | null; message?: string | null; details?: string | null; hint?: string | null};

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

function omitLegalFields(order: OrderPayload): OrderPayload {
    const blocked = new Set([
        "legal_terms_read",
        "legal_privacy_read",
        "legal_accepted",
        "legal_accepted_at",
        "legal_version",
    ]);
    return Object.fromEntries(Object.entries(order).filter(([key]) => !blocked.has(key)));
}

function appendNotes(base: unknown, legalNote: string) {
    const current = s(base);
    return current ? `${current}\n\n${legalNote}` : legalNote;
}

function isMissingLegalColumnError(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    if (error.code === "42703" && joined.includes("legal_")) return true;
    return joined.includes("does not exist") && joined.includes("legal_");
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

    const payload = {
        ...safe,
        user_id: user?.id ?? null,
        pending_token: pendingToken,
        status: "pending",
    };

    let {data, error} = await admin.from("orders").insert(payload).select("id, pending_token").single();

    if (isMissingLegalColumnError(error as PostgrestErrorLike | null)) {
        const withoutLegal = omitLegalFields(payload);
        withoutLegal.customer_notes = appendNotes(
            withoutLegal.customer_notes,
            formatLegalConsentNote({
                termsRead: legalConsent.termsRead,
                privacyRead: legalConsent.privacyRead,
                accepted: legalConsent.accepted,
                acceptedAt: legalConsent.acceptedAt,
                version: legalConsent.version,
            })
        );

        const retry = await admin
            .from("orders")
            .insert(withoutLegal)
            .select("id, pending_token")
            .single();
        data = retry.data;
        error = retry.error;
    }

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
