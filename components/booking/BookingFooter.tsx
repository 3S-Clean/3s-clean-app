"use client";

import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import { SERVICES, FINAL_PRICES, EXTRAS, getEstimatedHours } from "@/lib/booking/config";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const { step, canContinue, next, back } = useBookingNavigation();
    const {
        selectedService,
        apartmentSize,
        peopleCount,
        hasPets,
        extras,
    } = useBookingStore();
    const serviceId = selectedService ?? "";
    const sizeId = apartmentSize ?? "";
    const peopleId = peopleCount ?? "";
    const total = (() => {
        if (!serviceId || !sizeId || !peopleId) return 0;

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const ext = Object.entries(extras).reduce((s, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return s + (e ? e.price * q : 0);
        }, 0);

        return base + ext;
    })();

    const time = (() => {
        if (!serviceId || !sizeId) return "";

        let h = getEstimatedHours(serviceId, sizeId);

        Object.entries(extras).forEach(([id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            if (e && q > 0) h += e.hours * q;
        });

        const wh = Math.floor(h);
        const m = Math.round((h - wh) * 60);

        if (m === 0) return `${wh}h`;
        if (wh === 0) return `${m}min`;
        return `${wh}h ${m}min`;
    })();

    const service = SERVICES.find((s) => s.id === selectedService);
    const showPrice = serviceId && sizeId && peopleId;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
            <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
                <div className="flex flex-col">
                    {showPrice ? (
                        <>
                            <div className="text-2xl font-bold whitespace-nowrap">€&nbsp;{total.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 whitespace-nowrap">inc.VAT • ~{time}</div>
                        </>
                    ) : selectedService && !apartmentSize ? (
                        <>
                            <div className="text-xl font-semibold whitespace-nowrap">
                                From €&nbsp;{service?.startingPrice}
                            </div>
                            <div className="text-sm text-gray-500">Select apartment size</div>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500">
                            {step === 0 ? "Enter your PLZ" : step === 1 ? "Select a service" : "Continue"}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 shrink-0">
                    {step > 0 && (
                        <button
                            onClick={back}
                            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                        >
                            Back
                        </button>
                    )}

                    {step === 4 ? (
                        <button
                            onClick={onSubmit}
                            disabled={!canContinue || isSubmitting}
                            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                        >
                            {isSubmitting ? "Booking..." : "Continue"}
                        </button>
                    ) : (
                        <button
                            onClick={next}
                            disabled={!canContinue}
                            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}