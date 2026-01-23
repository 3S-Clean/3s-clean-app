"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import { SERVICES, FINAL_PRICES, EXTRAS, getEstimatedHours } from "@/lib/booking/config";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const { step, canContinue, next, back } = useBookingNavigation();
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } = useBookingStore();

    const serviceId = selectedService ?? "";
    const sizeId = apartmentSize ?? "";
    const peopleId = peopleCount ?? "";

    const service = SERVICES.find((s) => s.id === selectedService);
    const isFinalStep = step === 4;

    const totals = useMemo(() => {
        if (!serviceId || !sizeId || !peopleId) {
            return { total: 0, minutes: 0 };
        }

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const extrasPrice = Object.entries(extras || {}).reduce((sum, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.price * (Number(q) || 0) : 0);
        }, 0);

        let h = getEstimatedHours(serviceId, sizeId);
        Object.entries(extras || {}).forEach(([id, qRaw]) => {
            const q = Number(qRaw) || 0;
            const e = EXTRAS.find((x) => x.id === id);
            if (e && q > 0) h += e.hours * q;
        });

        return {
            total: r2(base + extrasPrice),
            minutes: Math.max(0, Math.round(h * 60)),
        };
    }, [serviceId, sizeId, peopleId, hasPets, extras]);

    const hint = useMemo(() => {
        switch (step) {
            case 0:
                return "Select a service";
            case 1:
                return "Enter your PLZ";
            case 2:
                return "Select apartment size & people";
            case 3:
                return "Choose extras (optional)";
            case 4:
                return "Complete required fields";
            default:
                return "Continue";
        }
    }, [step]);

    // ✅ Left info text (fix: no “Select apartment size” on PLZ step)
    const leftBlock = useMemo(() => {
        // If we can compute full total (means size+people selected)
        if (totals.total > 0) {
            const minutes = totals.minutes;
            const wh = Math.floor(minutes / 60);
            const m = minutes % 60;
            const time =
                minutes <= 0 ? "" : m === 0 ? `${wh}h` : wh === 0 ? `${m}min` : `${wh}h ${m}min`;

            return (
                <>
                    <div className="text-2xl font-bold whitespace-nowrap">€ {totals.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                        inc.VAT {time ? `• ~${time}` : ""}
                    </div>
                </>
            );
        }

        // Otherwise show step-specific guidance
        return (
            <>
                <div className="text-lg font-semibold whitespace-nowrap">
                    From € {service?.startingPrice ?? 0}
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">{hint}</div>
            </>
        );
    }, [totals.total, totals.minutes, service?.startingPrice, hint]);

    const primaryDisabled = !canContinue || !!isSubmitting;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
            <div className="px-4 md:px-6 pt-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0">{leftBlock}</div>

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
                                    disabled={primaryDisabled}
                                    className="px-5 md:px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                                >
                                    {isSubmitting ? "Booking..." : "Book now"}
                                </button>
                            ) : (
                                <button
                                    onClick={next}
                                    disabled={primaryDisabled}
                                    className="px-5 md:px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                                >
                                    Continue
                                </button>
                            )}
                        </div>

                        {/* ✅ Hint only when disabled */}
                        {!canContinue && !isSubmitting && (
                            <div className="text-xs text-gray-500 pr-1">{hint}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}