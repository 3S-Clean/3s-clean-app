"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import {
    SERVICES,
    EXTRAS,
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    getEstimatedHours,
    FINAL_PRICES,
} from "@/lib/booking/config";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const { step, canContinue, next, back } = useBookingNavigation();
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } =
        useBookingStore();

    const service = SERVICES.find((s) => s.id === selectedService);

    const sizeLabel =
        APARTMENT_SIZES.find((s) => s.id === apartmentSize)?.label ?? "";
    const peopleLabel =
        PEOPLE_OPTIONS.find((p) => p.id === peopleCount)?.label ?? "";

    // ✅ ONLY qty > 0
    const selectedExtrasLines = useMemo(() => {
        return Object.entries(extras || {}).filter(([_, q]) => (Number(q) || 0) > 0);
    }, [extras]);

    const extrasQtyTotal = useMemo(() => {
        return selectedExtrasLines.reduce((sum, [_, q]) => sum + (Number(q) || 0), 0);
    }, [selectedExtrasLines]);

    const totals = useMemo(() => {
        if (!selectedService || !apartmentSize || !peopleCount) {
            return { total: 0, timeLabel: "" };
        }

        const base =
            FINAL_PRICES?.[apartmentSize]?.[selectedService]?.[peopleCount]?.[
                hasPets ? "pet" : "noPet"
                ] ?? 0;

        const extrasSum = Object.entries(extras || {}).reduce((sum, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            const qty = Number(q) || 0;
            return sum + (e ? e.price * qty : 0);
        }, 0);

        // time
        let h = getEstimatedHours(selectedService, apartmentSize);
        Object.entries(extras || {}).forEach(([id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            const qty = Number(q) || 0;
            if (e && qty > 0) h += e.hours * qty;
        });
        const timeLabel = `~${Math.round(h * 60)}min`;

        return { total: base + extrasSum, timeLabel };
    }, [selectedService, apartmentSize, peopleCount, hasPets, extras]);

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
                return "Complete required fields";
            default:
                return "Continue";
        }
    }, [step]);

    const isFinalStep = step === 4;
    const showPrice = Boolean(selectedService && apartmentSize && peopleCount);

    return (
        <div
            className="fixed left-0 right-0 z-50 border-t border-gray-200 bg-white"
            style={{
                paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
            }}
        >
            <div className="max-w-2xl mx-auto px-4 pt-3">
                {/* ✅ SUMMARY INSIDE FOOTER (прямо над кнопками) */}
                {service && (
                    <div className="mb-3 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-sm px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="font-semibold text-sm truncate">
                                    {service.name}
                                </div>

                                <div className="text-xs text-gray-500 truncate">
                                    {apartmentSize ? sizeLabel : "Select size"}
                                    {peopleCount ? ` • ${peopleLabel}` : ""}
                                    {hasPets ? " • pets" : ""}
                                </div>

                                <div className="text-xs text-gray-400 mt-1">
                                    {selectedExtrasLines.length > 0
                                        ? `${selectedExtrasLines.length} extras selected (${extrasQtyTotal})`
                                        : "No extras selected"}{" "}
                                    • step {step + 1}/5
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="font-semibold text-sm whitespace-nowrap">
                                    {showPrice ? `€ ${totals.total.toFixed(2)}` : `From € ${service.startingPrice}`}
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                    {showPrice ? totals.timeLabel : "Select details"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* footer row */}
                <div className="flex items-center justify-between gap-4 pb-2">
                    <div className="flex flex-col min-w-0">
                        {showPrice ? (
                            <>
                                <div className="text-2xl font-bold whitespace-nowrap">
                                    € {totals.total.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500 whitespace-nowrap">
                                    inc.VAT • {totals.timeLabel}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">{hint}</div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex gap-2 shrink-0">
                            {step > 0 && (
                                <button
                                    onClick={back}
                                    className="px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                            )}

                            {isFinalStep ? (
                                <button
                                    onClick={() => onSubmit?.()}
                                    disabled={!canContinue || isSubmitting}
                                    className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                                >
                                    {isSubmitting ? "Booking..." : "Book now"}
                                </button>
                            ) : (
                                <button
                                    onClick={next}
                                    disabled={!canContinue}
                                    className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
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
                                    {hint}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}