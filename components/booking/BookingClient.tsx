"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import PostcodeCheck from "@/components/booking/PostcodeCheck";
import ServiceSelection from "@/components/booking/ServiceSelection";
import ApartmentDetails from "@/components/booking/ApartmentDetails";
import ExtraServices from "@/components/booking/ExtraServices";
import ContactSchedule from "@/components/booking/ContactSchedule";
import BookingFooter from "@/components/booking/BookingFooter";
import Header from "@/components/header/Header";

import { useBookingStore } from "@/lib/booking/store";
import { SERVICES, EXTRAS, getBasePrice, getEstimatedHours } from "@/lib/booking/config";

type OrderExtraLine = { id: string; quantity: number; price: number; name: string };
type CreateOrderOk = { orderId: string; pendingToken: string };
type CreateOrderErr = { error: string };

type CreateOrderResponse = CreateOrderOk | CreateOrderErr;

function isCreateOrderOk(v: unknown): v is CreateOrderOk {
    if (!v || typeof v !== "object") return false;
    const o = v as Record<string, unknown>;
    return typeof o.orderId === "string" && typeof o.pendingToken === "string";
}
const r2 = (n: number) => Math.round(n * 100) / 100;

function calculateTotals(
    service: string,
    size: string,
    people: string,
    hasPets: boolean,
    extras: Record<string, number>
) {
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
            price: r2(linePrice),
            name: extra.name,
        });
    }

    const estimatedHours = getEstimatedHours(service, size) + extrasHours;

    return {
        basePrice: r2(basePrice),
        extrasPrice: r2(extrasPrice),
        totalPrice: r2(basePrice + extrasPrice),
        estimatedHours: r2(estimatedHours),
        extras: extrasArray,
    };
}

type ProfileRow = {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    country: string | null;
    notes: string | null;
};

export default function BookingClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [autoPlzAdvanceDone, setAutoPlzAdvanceDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const {
        step,
        setStep,
        postcode,
        setPostcode,
        postcodeVerified,
        setPostcodeVerified,
        selectedService,
        setSelectedService, // ✅ важно для deep-link
        apartmentSize,
        peopleCount,
        hasPets,
        hasKids,
        hasAllergies,
        allergyNote,
        extras,
        formData,
        setFormData,
        selectedDate,
        selectedTime,
        setPendingToken,
    } = useBookingStore();

    // ✅ Deep-link: /booking?service=regular|deep|intensive|handover
    useEffect(() => {
        const raw = (searchParams.get("service") || "").trim().toLowerCase();
        if (!raw) return;

        const allowed = new Set(["regular", "deep", "intensive", "handover"]);
        if (!allowed.has(raw)) return;

        // если сервис уже выбран (пользователь кликал) — не мешаем
        if (selectedService) return;

        const found = SERVICES.find((s) => s.id === raw);
        if (!found) return;

        setSelectedService(found.id);

        // если сейчас на выборе сервиса — сразу идём на PLZ
        if (step === 0) setStep(1);
    }, [searchParams, selectedService, setSelectedService, step, setStep]);

    // Prefill profile data if user is logged in
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const { data: u } = await supabase.auth.getUser();
            const user = u?.user;
            if (!user || cancelled) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name,last_name,email,phone,address,postal_code,city,country,notes")
                .eq("id", user.id)
                .maybeSingle();

            if (cancelled || error || !data) return;

            const p = data as ProfileRow;
            const patch: Partial<typeof formData> = {};

            if (!formData.email?.trim()) {
                const em = (p.email || user.email || "").trim();
                if (em) patch.email = em;
            }
            if (!formData.firstName?.trim() && p.first_name?.trim()) patch.firstName = p.first_name.trim();
            if (!formData.lastName?.trim() && p.last_name?.trim()) patch.lastName = p.last_name.trim();
            if (!formData.phone?.trim() && p.phone?.trim()) patch.phone = p.phone.trim();
            if (!formData.address?.trim() && p.address?.trim()) patch.address = p.address.trim();
            if (!formData.postalCode?.trim() && p.postal_code?.trim()) patch.postalCode = p.postal_code.trim();
            if (!formData.city?.trim() && p.city?.trim()) patch.city = p.city.trim();
            if (!formData.country?.trim() && p.country?.trim()) patch.country = p.country.trim();
            if (!formData.notes?.trim() && p.notes?.trim()) patch.notes = p.notes.trim();
            if (Object.keys(patch).length) setFormData(patch);
            // Postcode gate: if profile has postal code, auto-verify and move past step 1
            const plz = (p.postal_code || "").trim();
            if (plz) {
                if (!postcode) setPostcode(plz);
                if (!postcodeVerified) setPostcodeVerified(true);

                // ✅ автопереход 1 -> 2 только один раз
                if (step === 1 && !autoPlzAdvanceDone) {
                    setStep(2);
                    setAutoPlzAdvanceDone(true);
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [
        supabase,
        step,
        setStep,
        postcode,
        setPostcode,
        postcodeVerified,
        setPostcodeVerified,
        setFormData,
        autoPlzAdvanceDone,
        formData.email,
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.address,
        formData.postalCode,
        formData.city,
        formData.country,
        formData.notes,
    ]);

    const submitBooking = async () => {
        if (isSubmitting) return;

        // Must be on final step and have all required selections
        if (step !== 4) return;
        if (!selectedService || !apartmentSize || !peopleCount || !selectedDate || !selectedTime) return;
        // Required customer fields
        if (
            !(formData.firstName || "").trim() ||
            !(formData.email || "").trim() ||
            !(formData.phone || "").trim() ||
            !(formData.address || "").trim() ||
            !(formData.postalCode || "").trim() ||
            !(formData.country || "").trim()
        ) {
            alert("Please fill in all required contact details.");
            return;
        }

        setIsSubmitting(true);

        try {
            const totals = calculateTotals(selectedService, apartmentSize, peopleCount, hasPets, extras);

            const orderData = {
                service_type: selectedService,
                apartment_size: apartmentSize,
                people_count: peopleCount,
                has_pets: hasPets,
                has_kids: hasKids,
                has_allergies: hasAllergies,
                allergy_note: hasAllergies ? (allergyNote || null) : null,

                extras: totals.extras,
                base_price: totals.basePrice,
                extras_price: totals.extrasPrice,
                total_price: totals.totalPrice,
                estimated_hours: totals.estimatedHours,
                customer_first_name: (formData.firstName || "").trim(),
                customer_last_name: (formData.lastName || "").trim() || null,
                customer_email: (formData.email || "").trim(),
                customer_phone: (formData.phone || "").trim(),
                customer_address: (formData.address || "").trim(),
                customer_postal_code: (formData.postalCode || "").trim(),
                customer_city: (formData.city || "").trim() || null,
                customer_country: (formData.country || "").trim(),
                customer_notes: (formData.notes || "").trim() || null,
                scheduled_date: selectedDate,
                scheduled_time: selectedTime,
            };

            const res = await fetch("/api/booking/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderData }),
            });

            const jsonUnknown = await res.json().catch(() => null);

            if (!res.ok || !isCreateOrderOk(jsonUnknown)) {
                console.error("create-order failed:", { status: res.status, jsonUnknown });
                alert("We couldn’t create the booking. Please try again.");
                return;
            }

            setPendingToken(jsonUnknown.pendingToken);
            router.push(`/booking/success?pendingOrder=${encodeURIComponent(jsonUnknown.pendingToken)}`);
        } catch (e) {
            console.error(e);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white mt-[80px]">
                <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-5">
                    <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-3 h-3 rounded-full transition-all
              ${s < step ? "bg-gray-900" : ""}
              ${s === step ? "bg-gray-900 scale-125" : ""}
              ${s > step ? "bg-gray-200" : ""}`}
                            />
                        ))}
                    </div>
                </header>
                <main className="max-w-2xl mx-auto px-6 py-10 pb-[calc(140px+env(safe-area-inset-bottom))]">
                    {step === 0 && <ServiceSelection />}
                    {step === 1 && <PostcodeCheck />}
                    {step === 2 && <ApartmentDetails />}
                    {step === 3 && <ExtraServices />}
                    {step === 4 && <ContactSchedule />}
                </main>
                {/* Button on step 0 — OK */}
                {step <=4 && <BookingFooter onSubmit={submitBooking} isSubmitting={isSubmitting} />}
            </div>
        </>
    );
}