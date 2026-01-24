"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import { SERVICES, FINAL_PRICES, EXTRAS, getEstimatedHours } from "@/lib/booking/config";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const { step, canContinue, next, back } = useBookingNavigation();
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } = useBookingStore();

    const serviceId = selectedService ?? "";
    const sizeId = apartmentSize ?? "";
    const peopleId = peopleCount ?? "";

    const service = SERVICES.find((s) => s.id === selectedService);

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

    const showPrice = Boolean(serviceId && sizeId && peopleId);
    const isFinalStep = step === 4;

    const hint = useMemo(() => {
        switch (step) {
            case 0:
                return "Select a service";
            case 1:
                return "Enter your PLZ";
            case 2:
                return "Apartment details";
            case 3:
                return "Extras";
            case 4:
                return "Contact & schedule";
            default:
                return "Continue";
        }
    }, [step]);

    const buttonHintText = isFinalStep ? "Complete required fields" : hint;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
            <div className="px-4 md:px-6 pt-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0">
                        {showPrice ? (
                            <>
                                <div className="text-2xl font-bold whitespace-nowrap">€&nbsp;{total.toFixed(2)}</div>
                                <div className="text-sm text-gray-500 whitespace-nowrap">inc.VAT • ~{time}</div>
                            </>
                        ) : selectedService ? (
                            <>
                                <div className="text-xl font-semibold whitespace-nowrap">
                                    From €&nbsp;{service?.startingPrice ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {step === 0 ? "Select apartment size" : hint}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">{hint}</div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex gap-2 md:gap-3 shrink-0">
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

                        <AnimatePresence initial={false}>
                            {!canContinue && !isSubmitting && (
                                <motion.div
                                    key="footer-hint"
                                    initial={{ opacity: 0, y: -2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -2 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-xs text-gray-500 pr-1"
                                >
                                    {buttonHintText}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}