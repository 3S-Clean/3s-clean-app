// lib/booking/actions.ts
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
    EXTRAS,
    getBasePrice,
    getEstimatedHours,
    type ExtrasMap,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";

/**
 * ✅ ВАЖНО (как в твоей схеме):
 * - public.service_areas: postal_code (НЕ postcode)
 * - public.notify_requests: postal_code (НЕ postcode)
 * - public.orders: pending_token uuid
 * - RPC: public.link_order_to_user(p_token uuid)
 * - RPC: public.get_order_success(p_token uuid)
 */

/* ===========================
   Pure totals calc (SYNC)
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

export function calculateOrderTotals(
    service: ServiceId,
    size: ApartmentSizeId,
    people: PeopleCountId,
    hasPets: boolean,
    extras: ExtrasMap
): OrderTotals {
    const basePrice = getBasePrice(service, size, people, hasPets);

    let extrasPrice = 0;
    let extrasHours = 0;

    const extrasArray: OrderExtraLine[] = [];

    for (const [extraId, qtyRaw] of Object.entries(extras ?? {})) {
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

    return {
        basePrice: Math.round(basePrice * 100) / 100,
        extrasPrice: Math.round(extrasPrice * 100) / 100,
        totalPrice: Math.round((basePrice + extrasPrice) * 100) / 100,
        estimatedHours: Math.round(estimatedHours * 100) / 100,
        extras: extrasArray,
    };
}

/* ===========================
   Server actions (ASYNC)
   =========================== */

export type AvailabilityResult = { available: boolean };

export async function checkPostalCode(postalCode: string): Promise<AvailabilityResult> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("service_areas")
        .select("postal_code")
        .eq("postal_code", postalCode)
        .eq("is_active", true)
        .maybeSingle();

    if (error) return { available: false };
    return { available: !!data };
}

// alias compatibility
export const checkPostcode = checkPostalCode;

export type NotifyResult = { success: boolean; error?: string };

export async function createNotifyRequest(email: string, postalCode: string): Promise<NotifyResult> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("notify_requests").insert({
        email,
        postal_code: postalCode,
    });

    return { success: !error, ...(error ? { error: error.message } : {}) };
}

// alias compatibility
export const submitNotifyRequest = createNotifyRequest;

export type ExistingBookingRow = {
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // "HH:mm"
    estimated_hours: number;
    status: string;
};

export async function getExistingBookings(
    startDate: string,
    endDate: string
): Promise<ExistingBookingRow[]> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("scheduled_date, scheduled_time, estimated_hours, status")
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .in("status", ["pending", "confirmed"]);

    if (error) return [];
    return (data ?? []) as ExistingBookingRow[];
}

export type CreateOrderInput = {
    service_type: ServiceId;
    apartment_size: ApartmentSizeId;
    people_count: PeopleCountId;

    has_pets: boolean;
    has_kids: boolean;
    has_allergies: boolean;
    allergy_note?: string | null;

    extras: OrderExtraLine[];
    base_price: number;
    extras_price: number;
    total_price: number;
    estimated_hours: number;

    customer_first_name: string;
    customer_last_name?: string | null;
    customer_email: string;
    customer_phone: string;

    customer_address: string;
    customer_city?: string | null;
    customer_postal_code: string;

    customer_notes?: string | null;

    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // "HH:mm"
};

export type CreateOrderResult =
    | { error: string }
    | { orderId: string; pendingToken: string };

export async function createOrder(orderData: CreateOrderInput): Promise<CreateOrderResult> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pendingToken = crypto.randomUUID();

    const payload = {
        ...orderData,
        user_id: user?.id ?? null,
        pending_token: pendingToken,
        status: "pending" as const,
    };

    const { data, error } = await supabase
        .from("orders")
        .insert(payload)
        .select("id, pending_token")
        .single();

    if (error) return { error: error.message };

    return { orderId: String(data.id), pendingToken: String(data.pending_token) };
}

export type LinkOrderResult = { success: boolean; orderId?: string | null; error?: string };

export async function linkOrderToUser(pendingToken: string): Promise<LinkOrderResult> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("link_order_to_user", {
        p_token: pendingToken,
    });

    if (error) return { success: false, error: error.message, orderId: null };
    return { success: true, orderId: data ? String(data) : null };
}

export type OrderSuccessRow = {
    service_type: string;
    scheduled_date: string;
    scheduled_time: string;
    estimated_hours: number;
    customer_address: string;
    customer_postal_code: string;
    total_price: number;
};

export async function getOrderSuccess(pendingToken: string): Promise<OrderSuccessRow | null> {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_order_success", {
        p_token: pendingToken,
    });

    if (error) return null;

    const row = Array.isArray(data) ? data[0] : data;
    return (row ?? null) as OrderSuccessRow | null;
}

export async function getOrder(orderId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (error) return null;
    return data;
}