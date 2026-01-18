"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/booking/store";
import { createOrder } from "@/lib/booking/actions";
import { calculatePrice, calculateHours } from "@/lib/booking/config";

// Components
import PostcodeCheck from "@/components/booking/PostcodeCheck";
import ServiceSelection from "@/components/booking/ServiceSelection";
import ApartmentDetails from "@/components/booking/ApartmentDetails";
import ExtraServices from "@/components/booking/ExtraServices";
import ContactSchedule from "@/components/booking/ContactSchedule";
import BookingFooter from "@/components/booking/BookingFooter";

export default function BookingPage() {
    const router = useRouter();

    const {
        step,
        nextStep,
        prevStep,
        selectedService,
        apartmentSize,
        peopleCount,
        hasPets,
        extras,
        formData,
        selectedDate,
        selectedTime,
        setPendingToken,
        reset,
    } = useBookingStore();

    const { totalPrice } =
        selectedService && apartmentSize && peopleCount
            ? calculatePrice(selectedService, apartmentSize, peopleCount, hasPets, extras)
            : { totalPrice: 0 };

    const estimatedHours =
        selectedService && apartmentSize ? calculateHours(selectedService, apartmentSize, extras) : 0;

    const canProceed = () => {
        switch (step) {
            case 0:
                return false; // handled inside PostcodeCheck
            case 1:
                return selectedService !== null;
            case 2:
                return apartmentSize !== null && peopleCount !== null;
            case 3:
                return true;
            case 4:
                return Boolean(
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
    };

    const handleSubmit = async () => {
        if (!selectedService || !apartmentSize || !peopleCount || !selectedDate || !selectedTime) return;

        const state = useBookingStore.getState();

        try {
            const result = await createOrder({
                serviceType: selectedService,
                apartmentSize,
                peopleCount,
                hasPets,

                hasKids: state.hasKids,
                hasAllergies: state.hasAllergies,

                // ⚠️ В сторе поле называется allergyNote.
                // Если createOrder ожидает allergyNote (а не allergyNotes), переименуй ключ ниже.
                allergyNotes: state.allergyNote,

                extras,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,

                customerFirstName: formData.firstName,
                customerLastName: formData.lastName,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                customerCity: formData.city,
                customerPostalCode: formData.postalCode || state.postcode,
                customerNotes: formData.notes,
            });

            if (result.isLoggedIn) {
                reset();
                router.push(`/booking/success?orderId=${result.orderId}`);
            } else {
                setPendingToken(result.pendingToken);
                router.push(
                    `/auth/register?email=${encodeURIComponent(formData.email)}&pendingOrder=${result.pendingToken}`
                );
            }
        } catch (e) {
            console.error("Error creating order:", e);
            alert("Failed to create booking. Please try again.");
        }
    };

    const handleContinue = () => {
        if (step === 4) void handleSubmit();
        else nextStep();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
            {/* Header with Progress */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-5">
                <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                s === step ? "bg-gray-900 scale-125" : s < step ? "bg-green-500" : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-10 pb-32">
                {step === 0 && <PostcodeCheck />}
                {step === 1 && <ServiceSelection />}
                {step === 2 && <ApartmentDetails />}
                {step === 3 && <ExtraServices />}
                {step === 4 && <ContactSchedule estimatedHours={estimatedHours} />}
            </main>

            {/* Footer with Price & Buttons */}
            {step > 0 && (
                <BookingFooter
                    selectedService={selectedService}
                    apartmentSize={apartmentSize}
                    peopleCount={peopleCount}
                    hasPets={hasPets}
                    totalPrice={totalPrice}
                    estimatedHours={estimatedHours}
                    canProceed={canProceed()}
                    isLastStep={step === 4}
                    onBack={prevStep}
                    onContinue={handleContinue}
                />
            )}
        </div>
    );
}