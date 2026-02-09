"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {createClient} from "@/shared/lib/supabase/client";

import PostcodeCheck from "@/features/booking/components/PostcodeCheck";
import ServiceSelection from "@/features/booking/components/ServiceSelection";
import ApartmentDetails from "@/features/booking/components/ApartmentDetails";
import ExtraServices from "@/features/booking/components/ExtraServices";
import ContactSchedule from "@/features/booking/components/ContactSchedule";
import BookingFooter from "@/features/booking/components/BookingFooter";
import {Header} from "@/shared/layout";

import {useBookingStore} from "@/features/booking/lib/store";
import {
    type ApartmentSizeId,
    EXTRAS,
    getBasePrice,
    getEstimatedHours,
    type PeopleCountId,
    type ServiceId,
    SERVICES,
} from "@/features/booking/lib/config";

import {useExtrasI18n} from "@/features/booking/lib/useExtrasI18n";
import {isApartmentSizeId, isExtraId, isPeopleCountId, isServiceId} from "@/features/booking/lib/guards";
import {isLegalConsentComplete, LEGAL_VERSION} from "@/shared/lib/legal/consent";

/* ----------------------------- Types ----------------------------- */
type OrderExtraLine = { id: string; quantity: number; price: number; name: string };
type CreateOrderOk = { orderId: string; pendingToken: string };

function isCreateOrderOk(v: unknown): v is CreateOrderOk {
    if (!v || typeof v !== "object") return false;
    const o = v as Record<string, unknown>;
    return typeof o.orderId === "string" && typeof o.pendingToken === "string";
}

const r2 = (n: number) => Math.round(n * 100) / 100;

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

/* ============================= Component ============================= */
export default function BookingClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = useMemo(() => createClient(), []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {getExtraText} = useExtrasI18n();

    const {
        step,
        setStep,

        selectedService,
        setSelectedService,

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
        termsRead,
        privacyRead,
        legalAccepted,
        legalAcceptedAt,

        setPendingToken,
    } = useBookingStore();

    /* ---------------- Guard step ---------------- */
    useEffect(() => {
        if (typeof step !== "number" || Number.isNaN(step) || step < 0 || step > 4) {
            setStep(0);
        }
    }, [step, setStep]);

    /* ---------------- Deep link ?service= ---------------- */
    useEffect(() => {
        const raw = (searchParams.get("service") || "").trim().toLowerCase();
        if (!raw || selectedService || !isServiceId(raw)) return;

        const found = SERVICES.find((s) => s.id === raw);
        if (!found) return;

        setSelectedService(found.id);
        if (step === 0) setStep(1);
    }, [searchParams, selectedService, setSelectedService, step, setStep]);

    /* ---------------- Prefill profile ---------------- */
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const {data: u} = await supabase.auth.getUser();
            if (!u?.user || cancelled) return;

            const {data} = await supabase
                .from("profiles")
                .select("first_name,last_name,email,phone,address,postal_code,city,country,notes")
                .eq("id", u.user.id)
                .maybeSingle();

            if (!data || cancelled) return;

            const p = data as ProfileRow;
            const patch: Partial<typeof formData> = {};

            if (!formData.email && (p.email || u.user.email)) patch.email = p.email ?? u.user.email ?? "";
            if (!formData.firstName && p.first_name) patch.firstName = p.first_name;
            if (!formData.lastName && p.last_name) patch.lastName = p.last_name;
            if (!formData.phone && p.phone) patch.phone = p.phone;
            if (!formData.address && p.address) patch.address = p.address;
            if (!formData.postalCode && p.postal_code) patch.postalCode = p.postal_code;
            if (!formData.city && p.city) patch.city = p.city;
            if (!formData.country && p.country) patch.country = p.country;
            if (!formData.notes && p.notes) patch.notes = p.notes;

            if (Object.keys(patch).length) setFormData(patch);
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [supabase, formData, setFormData]);

    /* ---------------- Totals ---------------- */
    const calculateTotals = useCallback(
        (
            service: ServiceId,
            size: ApartmentSizeId,
            people: PeopleCountId,
            hasPetsLocal: boolean,
            extrasLocal: Record<string, number>
        ) => {
            const basePrice = getBasePrice(service, size, people, hasPetsLocal);

            let extrasPrice = 0;
            let extrasHours = 0;
            const extrasArray: OrderExtraLine[] = [];

            for (const [extraId, qtyRaw] of Object.entries(extrasLocal || {})) {
                if (!isExtraId(extraId)) continue;

                const qty = Number(qtyRaw) || 0;
                if (qty <= 0) continue;

                const extra = EXTRAS.find((e) => e.id === extraId);
                if (!extra) continue;

                const linePrice = extra.price * qty;
                extrasPrice += linePrice;
                extrasHours += extra.hours * qty;

                const {name} = getExtraText(extraId);

                extrasArray.push({
                    id: extraId,
                    quantity: qty,
                    price: r2(linePrice),
                    name,
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
        },
        [getExtraText]
    );

    /* ---------------- Submit ---------------- */
    const submitBooking = async () => {
        if (isSubmitting || step !== 4) return;
        if (!selectedService || !selectedDate || !selectedTime) return;
        if (!apartmentSize || !peopleCount) return;

        if (!isServiceId(selectedService) || !isApartmentSizeId(apartmentSize) || !isPeopleCountId(peopleCount)) return;

        if (
            !formData.firstName ||
            !formData.email ||
            !formData.phone ||
            !formData.address ||
            !formData.postalCode ||
            !formData.city ||
            !formData.country
        ) {
            alert("Please fill in all required contact details.");
            return;
        }

        if (
            !isLegalConsentComplete({
                termsRead,
                privacyRead,
                accepted: legalAccepted,
                acceptedAt: legalAcceptedAt,
            })
        ) {
            alert("Please read Terms & Conditions and Privacy Policy, then confirm consent.");
            return;
        }

        setIsSubmitting(true);

        try {
            const totals = calculateTotals(selectedService, apartmentSize, peopleCount, hasPets, extras);

            const res = await fetch("/api/booking/create-order", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    orderData: {
                        service_type: selectedService,
                        apartment_size: apartmentSize,
                        people_count: peopleCount,
                        has_pets: hasPets,

                        has_kids: hasKids, // ✅ добавили
                        has_allergies: hasAllergies, // ✅ добавили
                        allergy_note: hasAllergies ? (allergyNote?.trim() || null) : null, // ✅ добавили

                        extras: totals.extras,
                        base_price: totals.basePrice,
                        extras_price: totals.extrasPrice,
                        total_price: totals.totalPrice,
                        estimated_hours: totals.estimatedHours,

                        customer_first_name: formData.firstName.trim(),
                        customer_last_name: formData.lastName?.trim() || null,
                        customer_email: formData.email.trim(),
                        customer_phone: formData.phone.trim(),
                        customer_address: formData.address.trim(),
                        customer_postal_code: formData.postalCode.trim(),
                        customer_city: formData.city?.trim() || null,
                        customer_country: formData.country.trim(),
                        customer_notes: formData.notes?.trim() || null,

                        legal_terms_read: termsRead,
                        legal_privacy_read: privacyRead,
                        legal_accepted: legalAccepted,
                        legal_accepted_at: legalAcceptedAt,
                        legal_version: LEGAL_VERSION,

                        scheduled_date: selectedDate,
                        scheduled_time: selectedTime,
                    },
                }),
            });

            const json = (await res.json().catch(() => null)) as unknown;
            if (!res.ok) {
                const message =
                    json &&
                    typeof json === "object" &&
                    "error" in json &&
                    typeof (json as {error?: unknown}).error === "string"
                        ? (json as {error: string}).error
                        : "";
                if (res.status === 409) {
                    alert(message || "This slot has just been booked. Please choose another time.");
                    return;
                }
                throw new Error(message || "create-order failed");
            }
            if (!isCreateOrderOk(json)) throw new Error("create-order failed");

            setPendingToken(json.pendingToken);
            router.push(`/booking/success?pendingOrder=${encodeURIComponent(json.pendingToken)}`);
        } catch (e) {
            console.error(e);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <>
            <Header/>
            <div className="min-h-screen bg-[var(--background)] mt-[80px] text-[var(--text)]">
                <header
                    className="sticky top-0 z-40 bg-[var(--background)] py-5 border-0 shadow-none ring-0 outline-none">
                    <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={[
                                    "w-3 h-3 rounded-full transition-all",
                                    s < step ? "bg-[var(--text)]/80" : "",
                                    s === step ? "bg-[var(--text)] scale-125" : "",
                                    s > step ? "bg-black/10 dark:bg-white/15" : "",
                                ].join(" ")}
                            />
                        ))}
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-6 py-10 pb-[calc(220px+env(safe-area-inset-bottom))]">
                    {step === 0 && <ServiceSelection/>}
                    {step === 1 && <PostcodeCheck/>}
                    {step === 2 && <ApartmentDetails/>}
                    {step === 3 && <ExtraServices/>}
                    {step === 4 && <ContactSchedule/>}
                </main>

                <BookingFooter onSubmit={submitBooking} isSubmitting={isSubmitting}/>
            </div>
        </>
    );
}
