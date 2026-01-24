"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import {
    SERVICES,
    FINAL_PRICES,
    EXTRAS,
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    getEstimatedHours,
} from "@/lib/booking/config";

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

    const service = SERVICES.find((s) => s.id === selectedService);
    const sizeLabel =
        APARTMENT_SIZES.find((s) => s.id === apartmentSize)?.label ?? "";
    const peopleLabel =
        PEOPLE_OPTIONS.find((p) => p.id === peopleCount)?.label ?? "";

    const totals = useMemo(() => {
        if (!selectedService || !apartmentSize || !peopleCount) {
            return { price: 0, time: "" };
        }

        const base =
            FINAL_PRICES[apartmentSize]?.[selectedService]?.[peopleCount]?.[
                hasPets ? "pet" : "noPet"
                ] ?? 0;

        let extraPrice = 0;
        let extraHours = 0;

        Object.entries(extras || {}).forEach(([id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            if (!e) return;
            extraPrice += e.price * Number(q || 0);
            extraHours += e.hours * Number(q || 0);
        });

        const hours = getEstimatedHours(selectedService, apartmentSize) + extraHours;
        const minutes = Math.round(hours * 60);

        return {
            price: base + extraPrice,
            time: `~${minutes}min`,
        };
    }, [selectedService, apartmentSize, peopleCount, hasPets, extras]);

    const showSummary = step > 0 && selectedService;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
            {/* SUMMARY */}
            {showSummary && (
                <div className="px-4 pt-3">
                    <div className="max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">
                        <div className="flex justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">
                                    {service?.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {sizeLabel}
                                    {peopleLabel && ` • ${peopleLabel}`}
                                    {hasPets && " • pets"}
                                </div>
                                <div className="text-xs text-gray-400">
                                    No extras selected • step {step + 1}/5
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="text-sm font-semibold whitespace-nowrap">
                                    {totals.price > 0
                                        ? `€ ${totals.price.toFixed(2)}`
                                        : `From € ${service?.startingPrice}`}
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                    {totals.time || "Select details"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER ACTIONS */}
            <div
                className="px-4 py-4"
                style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
            >
                <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
                    <div>
                        {totals.price > 0 ? (
                            <>
                                <div className="text-2xl font-bold">
                                    € {totals.price.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">inc. VAT</div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">
                                {step === 0 ? "Select a service" : "Complete required fields"}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {step > 0 && (
                            <button
                                onClick={back}
                                className="px-6 py-3 border rounded-full text-gray-700"
                            >
                                Back
                            </button>
                        )}

                        {step === 4 ? (
                            <button
                                onClick={onSubmit}
                                disabled={!canContinue || isSubmitting}
                                className="px-6 py-3 rounded-full bg-gray-900 text-white disabled:bg-gray-300"
                            >
                                {isSubmitting ? "Booking…" : "Book now"}
                            </button>
                        ) : (
                            <button
                                onClick={next}
                                disabled={!canContinue}
                                className="px-6 py-3 rounded-full bg-gray-900 text-white disabled:bg-gray-300"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}