"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import { SERVICES, FINAL_PRICES, EXTRAS, getEstimatedHours } from "@/lib/booking/config";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

const STEP_HINT: Record<number, string> = {
    0: "Select a service",
    1: "Enter your PLZ",
    2: "Apartment details",
    3: "Extras (optional)",
    4: "Contact & schedule",
};

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const { step, canContinue, next, back } = useBookingNavigation();
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } = useBookingStore();

    const serviceId = selectedService ?? "";
    const sizeId = apartmentSize ?? "";
    const peopleId = peopleCount ?? "";

    const total = useMemo(() => {
        if (!serviceId || !sizeId || !peopleId) return 0;

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const ext = Object.entries(extras || {}).reduce((s, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return s + (e ? e.price * (Number(q) || 0) : 0);
        }, 0);

        return base + ext;
    }, [serviceId, sizeId, peopleId, hasPets, extras]);

    const time = useMemo(() => {
        if (!serviceId || !sizeId) return "";

        let h = getEstimatedHours(serviceId, sizeId);

        Object.entries(extras || {}).forEach(([id, qRaw]) => {
            const q = Number(qRaw) || 0;
            const e = EXTRAS.find((x) => x.id === id);
            if (e && q > 0) h += e.hours * q;
        });

        const wh = Math.floor(h);
        const m = Math.round((h - wh) * 60);

        if (m === 0) return `${wh}h`;
        if (wh === 0) return `${m}min`;
        return `${wh}h ${m}min`;
    }, [serviceId, sizeId, extras]);

    const service = SERVICES.find((s) => s.id === selectedService);
    const showPrice = Boolean(serviceId && sizeId && peopleId);
    const isFinalStep = step === 4;

    // ✅ Подсказка снизу кнопки — только когда disabled
    const footerHint = isFinalStep ? "Complete required fields" : (STEP_HINT[step] ?? "Continue");
    const showHint = !canContinue && !isSubmitting;

    // ✅ Левый текст (не путать шаги!)
    const leftTitle = showPrice
        ? `€ ${total.toFixed(2)}`
        : selectedService
            ? `From € ${service?.startingPrice ?? ""}`
            : "";

    const leftSubtitle = showPrice
        ? `inc. VAT • ~${time}`
        : (STEP_HINT[step] ?? "");

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
            <div className="px-4 md:px-6 pt-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0">
                        {leftTitle ? (
                            <>
                                <div className="text-2xl font-bold whitespace-nowrap">{leftTitle}</div>
                                <div className="text-sm text-gray-500 whitespace-nowrap">{leftSubtitle}</div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">{STEP_HINT[step] ?? "Continue"}</div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex gap-2 md:gap-3">
                            {step > 0 && (
                                <button
                                    onClick={back}
                                    className="px-5 md:px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                            )}

                            {isFinalStep ? (
                                <button
                                    onClick={() => onSubmit?.()}
                                    disabled={!canContinue || isSubmitting}
                                    className="px-5 md:px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                                >
                                    {isSubmitting ? "Booking..." : "Book now"}
                                </button>
                            ) : (
                                <button
                                    onClick={next}
                                    disabled={!canContinue}
                                    className="px-5 md:px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                                >
                                    Continue
                                </button>
                            )}
                        </div>

                        <div
                            className={`text-xs text-gray-500 pr-1 transition-opacity ${showHint ? "opacity-100" : "opacity-0"}`}
                            aria-live="polite"
                        >
                            {footerHint}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}