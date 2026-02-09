"use client";

import {
    type ApartmentSizeId,
    type ExtraId,
    EXTRAS,
    getBasePrice,
    getEstimatedHours,
    type PeopleCountId,
    roundHoursToQuarterUp,
    type ServiceId,
} from "@/features/booking/lib/config";
import {isApartmentSizeId, isExtraId, isPeopleCountId, isServiceId} from "@/features/booking/lib/guards";

/* ===========================
   Types
   =========================== */

export type OrderExtraLine = {
    id: ExtraId;
    quantity: number;
    price: number; // line total
    // ✅ since EXTRAS has NO texts, we store i18n keys (UI translates)
    nameKey: `extras.${ExtraId}.name`;
    unitKey?: `extras.${ExtraId}.unit`;
};

export type OrderTotals = {
    basePrice: number;
    extrasPrice: number;
    totalPrice: number;
    estimatedHours: number;
    extras: OrderExtraLine[];
};

export type ExistingBookingRow = {
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number;
};

export type CreateOrderPayload = {
    service_type: ServiceId;
    apartment_size: ApartmentSizeId;
    people_count: PeopleCountId;

    has_pets: boolean;
    has_kids: boolean;
    has_allergies: boolean;
    allergy_note: string | null;

    extras: Array<{
        id: ExtraId;
        quantity: number;
        price: number; // line total
        nameKey: `extras.${ExtraId}.name`;
        unitKey?: `extras.${ExtraId}.unit`;
    }>;

    base_price: number;
    extras_price: number;
    total_price: number;
    estimated_hours: number;

    customer_first_name: string;
    customer_last_name: string | null;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_postal_code: string;
    customer_city?: string | null;
    customer_country?: string | null;
    customer_notes: string | null;

    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
};

export type CreateOrderResponse =
    | { orderId: string; pendingToken: string }
    | { error: string };

export type LinkOrderResponse =
    | { success: true; orderId: string }
    | { success: false; error?: string };

export type GetOrderPublicResponse =
    | {
    order: {
        id: string;
        service_type: string;
        scheduled_date: string;
        scheduled_time: string;
        estimated_hours: number;
        total_price: number;
        status: string;
        created_at: string;
    };
}
    | { error: string };

/* ===========================
   Helpers
   =========================== */

const r2 = (n: number) => Math.round(n * 100) / 100;

function normalizeIds(input: {
    service: string;
    size: string;
    people: string;
}): { serviceId: ServiceId; sizeId: ApartmentSizeId; peopleId: PeopleCountId } {
    const {service, size, people} = input;

    if (!isServiceId(service)) throw new Error(`Invalid service id: ${service}`);
    if (!isApartmentSizeId(size)) throw new Error(`Invalid apartment size id: ${size}`);
    if (!isPeopleCountId(people)) throw new Error(`Invalid people count id: ${people}`);

    return {serviceId: service, sizeId: size, peopleId: people};
}

/* ===========================
   Pure calc (no API)
   =========================== */

export function calculateOrderTotals(
    service: string,
    size: string,
    people: string,
    hasPets: boolean,
    extras: Record<string, number>
): OrderTotals {
    // ✅ type-safe ids from strings (fixes build error)
    const {serviceId, sizeId, peopleId} = normalizeIds({service, size, people});
    const basePrice = getBasePrice(serviceId, sizeId, peopleId, hasPets);

    let extrasPrice = 0;
    let extrasHours = 0;

    const extrasArray: OrderExtraLine[] = [];

    for (const [extraIdRaw, qtyRaw] of Object.entries(extras || {})) {
        const qty = Number(qtyRaw) || 0;
        if (qty <= 0) continue;

        if (!isExtraId(extraIdRaw)) continue;
        const extraId = extraIdRaw as ExtraId;

        const extra = EXTRAS.find((e) => e.id === extraId);
        if (!extra) continue;

        const linePrice = extra.price * qty;
        extrasPrice += linePrice;
        extrasHours += extra.hours * qty;

        extrasArray.push({
            id: extraId,
            quantity: qty,
            price: r2(linePrice),
            nameKey: `extras.${extraId}.name`,
            unitKey: `extras.${extraId}.unit`,
        });
    }

    const estimatedHours = roundHoursToQuarterUp(getEstimatedHours(serviceId, sizeId) + extrasHours);

    return {
        basePrice: r2(basePrice),
        extrasPrice: r2(extrasPrice),
        totalPrice: r2(basePrice + extrasPrice),
        estimatedHours: r2(estimatedHours),
        extras: extrasArray,
    };
}

/* ===========================
   Client -> API (fetch)
   =========================== */

async function postJSON<TReq extends Record<string, unknown>, TRes>(
    url: string,
    body: TReq
): Promise<TRes> {
    const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : `Request failed: ${res.status}`;
        throw new Error(msg);
    }

    return json as unknown as TRes;
}

export function checkPostcode(postcode: string) {
    return postJSON<{ postcode: string }, { available: boolean }>(
        "/api/booking/check-postcode",
        {postcode}
    );
}

export function submitNotifyRequest(email: string, postcode: string) {
    return postJSON<{ email: string; postcode: string }, { success: boolean }>(
        "/api/notify",
        {email, postcode}
    );
}

export function createOrder(orderData: CreateOrderPayload) {
    return postJSON<{ orderData: CreateOrderPayload }, CreateOrderResponse>(
        "/api/booking/create-order",
        {orderData}
    );
}

export function linkOrderToUser(pendingToken: string) {
    return postJSON<{ pendingToken: string }, LinkOrderResponse>(
        "/api/booking/link-order",
        {pendingToken}
    );
}

export function getExistingBookings(startDate: string, endDate: string) {
    return postJSON<{ startDate: string; endDate: string }, ExistingBookingRow[]>(
        "/api/booking/existing-bookings",
        {startDate, endDate}
    );
}

export function getOrder(orderId: string) {
    return postJSON<{ orderId: string }, unknown>("/api/booking/get-order", {orderId});
}

export function getOrderPublic(orderId?: string, pendingToken?: string) {
    return postJSON<{ orderId?: string; pendingToken?: string }, GetOrderPublicResponse>(
        "/api/booking/get-order-public",
        {orderId, pendingToken}
    );
}
