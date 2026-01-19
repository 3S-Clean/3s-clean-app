"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBookingStore } from "@/lib/booking/store";
import { EXTRAS, getBasePrice, getEstimatedHours } from "@/lib/booking/config";

import PostcodeCheck from "@/components/booking/PostcodeCheck";
import ServiceSelection from "@/components/booking/ServiceSelection";
import ApartmentDetails from "@/components/booking/ApartmentDetails";
import ExtraServices from "@/components/booking/ExtraServices";
import ContactSchedule from "@/components/booking/ContactSchedule";
import BookingFooter from "@/components/booking/BookingFooter";
import Header from "@/components/account/header/Header";

type OrderExtraLine = { id: string; quantity: number; price: number; name: string };

type CreateOrderResponse =
    | { orderId: string; pendingToken: string }
    | { error: string };

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

export default function BookingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        step,
        setStep,

        postcode,
        postcodeVerified,

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

    const canContinue = useMemo(() => {
        switch (step) {
            case 0:
                return !!postcodeVerified;
            case 1:
                return !!selectedService;
            case 2:
                return !!apartmentSize && !!peopleCount;
            case 3:
                return true;
            case 4:
                return !!(
                    formData.firstName &&
                    formData.email &&
                    formData.phone &&
                    formData.address &&
                    selectedDate &&
                    selectedTime
                );
            default:
                return false;
        }
    }, [
        step,
        postcodeVerified,
        selectedService,
        apartmentSize,
        peopleCount,
        formData.firstName,
        formData.email,
        formData.phone,
        formData.address,
        selectedDate,
        selectedTime,
    ]);

    const handleNext = () => {
        if (!canContinue) return;
        setStep(Math.min(4, step + 1));
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(Math.max(0, step - 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!selectedService || !apartmentSize || !peopleCount || !selectedDate || !selectedTime) return;

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
                allergy_note: hasAllergies ? allergyNote : null,

                extras: totals.extras,
                base_price: totals.basePrice,
                extras_price: totals.extrasPrice,
                total_price: totals.totalPrice,
                estimated_hours: totals.estimatedHours,

                customer_first_name: formData.firstName,
                customer_last_name: formData.lastName || null,
                customer_email: formData.email,
                customer_phone: formData.phone,
                customer_address: formData.address,
                customer_postal_code: postcode,
                customer_notes: formData.notes || null,

                scheduled_date: selectedDate,
                scheduled_time: selectedTime,
            };

            const res = await fetch("/api/booking/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderData }),
            });

            const json = (await res.json()) as CreateOrderResponse;

            if (!res.ok || "error" in json) {
                alert("Error: " + ("error" in json ? json.error : "Failed to create order."));
                return;
            }

            // ✅ всегда есть pendingToken
            setPendingToken(json.pendingToken);

            // ✅ success для гостя (по pendingToken)
            router.push(`/booking/success?pendingToken=${encodeURIComponent(json.pendingToken)}`);
        } catch {
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            <div className="min-h-screen bg-white">
                {/* progress dots */}
                <header className="sticky top-[90px] z-40 bg-white/80 backdrop-blur border-b border-gray-100 py-5">
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

                <main className="max-w-2xl mx-auto px-6 py-10 pb-32">
                    {step === 0 && <PostcodeCheck />}
                    {step === 1 && <ServiceSelection />}
                    {step === 2 && <ApartmentDetails />}
                    {step === 3 && <ExtraServices />}
                    {step === 4 && <ContactSchedule />}
                </main>

                {/* ✅ footer всегда */}
                <BookingFooter
                    onBack={handleBack}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </>
    );
}
