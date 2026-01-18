"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
    calculateHours,
    calculatePrice,
    EXTRAS,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";

export type BookingStatus =
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";

export type ExistingBooking = {
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number;
};

type ServiceAreaRow = {
    postal_code: string | null;
    city: string | null;
    district: string | null;
    is_active: boolean | null;
};

type OrderRow = {
    scheduled_date: string | null;
    scheduled_time: string | null;
    estimated_hours: number | null;
    status: BookingStatus | null;
};

export type CreateOrderInput = {
    serviceType: ServiceId;
    apartmentSize: ApartmentSizeId;
    peopleCount: PeopleCountId;

    hasPets: boolean;
    hasKids: boolean;
    hasAllergies: boolean;
    allergyNotes?: string;

    extras: Record<string, number>;

    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // HH:mm

    customerFirstName: string;
    customerLastName?: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity?: string;
    customerPostalCode: string;
    customerNotes?: string;
};

function normalizePostcode(value: string) {
    return (value ?? "").replace(/\D/g, "").slice(0, 5);
}

function normalizeEmail(value: string) {
    return (value ?? "").trim().toLowerCase();
}

/** POSTCODE CHECK */
export async function checkPostalCode(
    postalCodeRaw: string
): Promise<{
    available: boolean;
    area?: { postal_code: string; city: string; district: string | null };
}> {
    const postalCode = normalizePostcode(postalCodeRaw);
    if (postalCode.length !== 5) return { available: false };

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("service_areas")
        .select("postal_code, city, district, is_active")
        .eq("postal_code", postalCode)
        .eq("is_active", true)
        .maybeSingle()
        .returns<ServiceAreaRow>();

    if (error || !data) return { available: false };

    const pc = data.postal_code ?? postalCode;
    const city = data.city ?? "";
    const district = data.district ?? null;

    if (!city) return { available: false };

    return { available: true, area: { postal_code: pc, city, district } };
}

/** NOTIFY REQUEST */
export async function createNotifyRequest(
    emailRaw: string,
    postalCodeRaw: string
): Promise<{ ok: boolean }> {
    const email = normalizeEmail(emailRaw);
    const postalCode = normalizePostcode(postalCodeRaw);

    if (!email.includes("@") || postalCode.length !== 5) return { ok: false };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("notify_requests").insert({
        email,
        postal_code: postalCode,
    });

    return { ok: !error };
}

/** EXISTING BOOKINGS */
export async function getExistingBookings(
    startDate: string,
    endDate: string
): Promise<ExistingBooking[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("scheduled_date, scheduled_time, estimated_hours, status")
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .neq("status", "cancelled")
        .order("scheduled_date", { ascending: true })
        .returns<OrderRow[]>();

    if (error || !data) return [];

    return data
        .filter((r) => r.scheduled_date && r.scheduled_time && r.estimated_hours != null)
        .map((r) => ({
            scheduled_date: String(r.scheduled_date),
            scheduled_time: String(r.scheduled_time),
            estimated_hours: Number(r.estimated_hours),
        }));
}

/** CREATE ORDER */
export async function createOrder(
    input: CreateOrderInput
): Promise<{ orderId: string; pendingToken: string; isLoggedIn: boolean }> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { basePrice, extrasPrice, totalPrice } = calculatePrice(
        input.serviceType,
        input.apartmentSize,
        input.peopleCount,
        input.hasPets,
        input.extras
    );

    const estimatedHours = calculateHours(input.serviceType, input.apartmentSize, input.extras);

    const extrasQuantities: Record<string, number> = {};
    for (const [id, qty] of Object.entries(input.extras ?? {})) {
        const n = Number(qty);
        if (Number.isFinite(n) && n > 0) extrasQuantities[id] = n;
    }

    const priceBreakdown = Object.entries(extrasQuantities).map(([id, quantity]) => {
        const extra = EXTRAS.find((e) => e.id === id);
        const unitPrice = extra ? Number(extra.price) : 0;
        return {
            id,
            name: extra?.name ?? id,
            quantity,
            unitPrice,
            lineTotal: Math.round(unitPrice * quantity * 100) / 100,
        };
    });

    const customerPostalCode = normalizePostcode(input.customerPostalCode);

    const { data: order, error } = await supabase
        .from("orders")
        .insert({
            user_id: user?.id ?? null,

            service_type: input.serviceType,
            apartment_size: input.apartmentSize,
            people_count: input.peopleCount,

            has_pets: input.hasPets,
            has_kids: input.hasKids,
            has_allergies: input.hasAllergies,
            allergy_notes: input.allergyNotes ?? null,

            extras: extrasQuantities,
            price_breakdown: priceBreakdown,

            scheduled_date: input.scheduledDate,
            scheduled_time: input.scheduledTime,
            estimated_hours: estimatedHours,

            customer_first_name: input.customerFirstName,
            customer_last_name: input.customerLastName ?? null,
            customer_email: input.customerEmail,
            customer_phone: input.customerPhone,
            customer_address: input.customerAddress,
            customer_city: input.customerCity ?? null,
            customer_postal_code: customerPostalCode,
            customer_notes: input.customerNotes ?? null,

            base_price: basePrice,
            extras_price: extrasPrice,
            total_price: totalPrice,

            status: "pending" satisfies BookingStatus,
        })
        .select("id, pending_token")
        .single();

    if (error || !order) throw new Error("Failed to create order");

    return {
        orderId: String(order.id),
        pendingToken: String(order.pending_token),
        isLoggedIn: !!user,
    };
}

/**
 * LINK ORDER TO USER
 * ✅ ВАЖНО: возвращаем СТРОКУ orderId
 */
export async function linkOrderToUser(pendingToken: string): Promise<string> {
    const token = (pendingToken ?? "").trim();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("link_order_to_user", { p_token: token });

    if (error || !data) throw new Error("Failed to link order to user");

    // data может быть uuid/string — приводим к string
    return String(data);
}

/** SUCCESS FETCH */
export async function getOrderSuccess(pendingToken: string) {
    const token = (pendingToken ?? "").trim();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_order_success", { p_token: token });

    if (error || !data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
}

/** USER ORDERS */
export async function getUserOrders() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
}

/** USER PROFILE */
export async function getUserProfile() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) return null;

    return data;
}

export async function updateUserProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
}) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const postal = profileData.postalCode ? normalizePostcode(profileData.postalCode) : undefined;

    const { error } = await supabase
        .from("profiles")
        .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: profileData.phone,
            address: profileData.address,
            city: profileData.city,
            postal_code: postal,
        })
        .eq("id", user.id);

    if (error) throw new Error("Failed to update profile");
    return { ok: true };
}