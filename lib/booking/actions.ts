// lib/booking/actions.ts
"use client";

import { EXTRAS, getBasePrice, getEstimatedHours } from "@/lib/booking/config";

/* ===========================
   Types
   =========================== */

export type OrderExtraLine = {
    id: string;
    quantity: number;
    price: number; // line total
    name: string;
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
    service_type: string;
    apartment_size: string;
    people_count: string;
    has_pets: boolean;
    has_kids: boolean;
    has_allergies: boolean;
    allergy_note: string | null;

    extras: OrderExtraLine[];
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
   Pure calc (no API)
   =========================== */

export function calculateOrderTotals(
    service: string,
    size: string,
    people: string,
    hasPets: boolean,
    extras: Record<string, number>
): OrderTotals {
    const basePrice = getBasePrice(service, size, people, hasPets);

    let extrasPrice = 0;
    let extrasHours = 0;

    const extrasArray: OrderExtraLine[] = [];

    for (const [extraId, qtyRaw] of Object.entries(extras || {})) {
        const qty = Number(qtyRaw) || 0;
        if (qty <= 0) continue;

        const extra = EXTRAS.find((e) => e.id === extraId);
        if (!extra) continue;

        const linePrice = extra.price * qty;
        extrasPrice += linePrice;
        extrasHours += extra.hours * qty;

        extrasArray.push({
            id: extraId,
            quantity: qty,
            price: Math.round(linePrice * 100) / 100,
            name: extra.name,
        });
    }

    const estimatedHours = getEstimatedHours(service, size) + extrasHours;

    const r2 = (n: number) => Math.round(n * 100) / 100;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
        const msg =
            typeof json.error === "string" ? json.error : `Request failed: ${res.status}`;
        throw new Error(msg);
    }

    return json as unknown as TRes;
}

export function checkPostcode(postcode: string) {
    return postJSON<{ postcode: string }, { available: boolean }>(
        "/api/booking/check-postcode",
        { postcode }
    );
}

export function submitNotifyRequest(email: string, postcode: string) {
    return postJSON<{ email: string; postcode: string }, { success: boolean }>(
        "/api/notify",
        { email, postcode }
    );
}

export function createOrder(orderData: CreateOrderPayload) {
    return postJSON<{ orderData: CreateOrderPayload }, CreateOrderResponse>(
        "/api/booking/create-order",
        { orderData }
    );
}

export function linkOrderToUser(pendingToken: string) {
    return postJSON<{ pendingToken: string }, LinkOrderResponse>(
        "/api/booking/link-order",
        { pendingToken }
    );
}

export function getExistingBookings(startDate: string, endDate: string) {
    return postJSON<{ startDate: string; endDate: string }, ExistingBookingRow[]>(
        "/api/booking/existing-bookings",
        { startDate, endDate }
    );
}

export function getOrder(orderId: string) {
    return postJSON<{ orderId: string }, unknown>("/api/booking/get-order", { orderId });
}

export function getOrderPublic(orderId?: string, pendingToken?: string) {
    return postJSON<
        { orderId?: string; pendingToken?: string },
        GetOrderPublicResponse
    >("/api/booking/get-order-public", { orderId, pendingToken });
}