// app/booking/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PostcodeCheck from "@/components/booking/PostcodeCheck";
import ServiceSelection from "@/components/booking/ServiceSelection";
import ApartmentDetails from "@/components/booking/ApartmentDetails";
import ExtraServices from "@/components/booking/ExtraServices";
import ContactSchedule from "@/components/booking/ContactSchedule";
import BookingFooter from "@/components/booking/BookingFooter";

import { useBookingStore } from "@/lib/booking/store";
import { createOrder, calculateOrderTotals } from "@/lib/booking/actions";

import {
    SERVICES,
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
    type ExtrasMap,
} from "@/lib/booking/config";

function ProgressDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => {
                const isPast = i < step;
                const isCurrent = i === step;

                const cls = isPast
                    ? "bg-black"
                    : isCurrent
                        ? "bg-white border border-black"
                        : "bg-black/20";

                const size = isCurrent ? "h-3.5 w-3.5" : "h-3 w-3";

                return <span key={i} className={`${size} rounded-full ${cls}`} />;
            })}
        </div>
    );
}

/** ---- type guards (чтобы не менять store.ts) ---- */
const SERVICE_IDS = new Set(SERVICES.map((s) => s.id));
const SIZE_IDS = new Set(APARTMENT_SIZES.map((s) => s.id));
const PEOPLE_IDS = new Set(PEOPLE_OPTIONS.map((p) => p.id));

function isServiceId(v: unknown): v is ServiceId {
    return typeof v === "string" && SERVICE_IDS.has(v as ServiceId);
}
function isApartmentSizeId(v: unknown): v is ApartmentSizeId {
    return typeof v === "string" && SIZE_IDS.has(v as ApartmentSizeId);
}
function isPeopleCountId(v: unknown): v is PeopleCountId {
    return typeof v === "string" && PEOPLE_IDS.has(v as PeopleCountId);
}

type CreateOrderResult =
    | { error: string }
    | { pendingToken: string }
    | { orderId: string };

export default function BookingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        step,
        nextStep,
        prevStep,

        postcode,

        selectedService,
        apartmentSize,
        peopleCount,
        hasPets,
        hasKids,
        hasAllergies,
        allergyNote,
        extras,

        formData,
        selectedDate,
        selectedTime,

        setPendingToken,
    } = useBookingStore();

    const canContinue = (): boolean => {
        if (step === 0) return true; // PostcodeCheck сам решает
        if (step === 1) return isServiceId(selectedService);
        if (step === 2) return isApartmentSizeId(apartmentSize) && isPeopleCountId(peopleCount);
        if (step === 3) return true;
        if (step === 4) {
            return !!(
                formData.firstName &&
                formData.email &&
                formData.phone &&
                formData.address &&
                selectedDate &&
                selectedTime
            );
        }
        return false;
    };

    const handleNext = async () => {
        // шаг 4 = submit
        if (step === 4) {
            await handleSubmit();
            return;
        }

        nextStep();
        if (typeof window !== "undefined") window.scrollTo(0, 0);
    };

    const handleBack = () => {
        prevStep();
        if (typeof window !== "undefined") window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        // Жёстко валидируем типы (иначе TS ругается и логика может упасть)
        if (!isServiceId(selectedService)) return;
        if (!isApartmentSizeId(apartmentSize)) return;
        if (!isPeopleCountId(peopleCount)) return;
        if (!selectedDate || !selectedTime) return;

        setIsSubmitting(true);

        try {
            const totals = calculateOrderTotals(
                selectedService,
                apartmentSize,
                peopleCount,
                hasPets,
                (extras ?? {}) as ExtrasMap
            );

            const result = (await createOrder({
                service_type: selectedService,
                apartment_size: apartmentSize,
                people_count: peopleCount,
                has_pets: hasPets,
                has_kids: hasKids,
                has_allergies: hasAllergies,
                allergy_note: hasAllergies ? allergyNote : undefined,

                extras: totals.extras,
                base_price: totals.basePrice,
                extras_price: totals.extrasPrice,
                total_price: totals.totalPrice,
                estimated_hours: totals.estimatedHours,

                customer_first_name: formData.firstName,
                customer_last_name: formData.lastName || undefined,
                customer_email: formData.email,
                customer_phone: formData.phone,
                customer_address: formData.address,
                customer_postal_code: postcode,

                customer_notes: formData.notes || undefined,
                scheduled_date: selectedDate,
                scheduled_time: selectedTime,
            })) as CreateOrderResult;

            if ("error" in result) {
                alert(`Error: ${result.error}`);
                return;
            }

            if ("pendingToken" in result) {
                setPendingToken(result.pendingToken);
                // ✅ под твой success page: searchParams.token
                router.push(`/booking/success?token=${encodeURIComponent(result.pendingToken)}`);
                return;
            }

            if ("orderId" in result) {
                // fallback, если вдруг вернулся только orderId
                router.push(`/booking/success?orderId=${encodeURIComponent(result.orderId)}`);
            }
        } catch {
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextLabel = step === 4 ? (isSubmitting ? "Booking..." : "Confirm booking") : "Continue";
    const nextDisabled = !canContinue() || (step === 4 && isSubmitting);

    return (
        <div className="min-h-screen bg-[#f6f5f2]">
            <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f5f2]/80 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-2xl px-4 py-5">
                    <ProgressDots step={step} total={5} />
                </div>
            </header>

            <main className="mx-auto w-full max-w-2xl px-4 py-10 pb-32">
                {step === 0 && <PostcodeCheck />}
                {step === 1 && <ServiceSelection />}
                {step === 2 && <ApartmentDetails />}
                {step === 3 && <ExtraServices />}
                {step === 4 && <ContactSchedule />}
            </main>

            {step > 0 && (
                <BookingFooter
                    onBack={handleBack}
                    onNext={handleNext}
                    nextDisabled={nextDisabled}
                    nextLabel={nextLabel}
                    backLabel="Back"
                />
            )}
        </div>
    );
}