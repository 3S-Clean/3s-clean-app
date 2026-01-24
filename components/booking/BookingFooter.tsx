"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import { SERVICES, FINAL_PRICES, EXTRAS, getEstimatedHours, APARTMENT_SIZES, PEOPLE_OPTIONS } from "@/lib/booking/config";
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

    const service = useMemo(() => SERVICES.find((s) => s.id === serviceId), [serviceId]);

    const sizeLabel = useMemo(
        () => APARTMENT_SIZES.find((s) => s.id === sizeId)?.label ?? "",
        [sizeId]
    );

    const peopleLabel = useMemo(
        () => PEOPLE_OPTIONS.find((p) => p.id === peopleId)?.label ?? "",
        [peopleId]
    );

    // ✅ extras count = SUM of quantities
    const extrasCount = useMemo(() => {
        return Object.values(extras || {}).reduce((sum, q) => sum + (Number(q) || 0), 0);
    }, [extras]);

    const showPrice = Boolean(serviceId && sizeId && peopleId);

    const total = useMemo(() => {
        if (!showPrice) return 0;

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const ext = Object.entries(extras || {}).reduce((s, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return s + (e ? e.price * (Number(q) || 0) : 0);
        }, 0);

        return base + ext;
    }, [showPrice, sizeId, serviceId, peopleId, hasPets, extras]);

    const timeText = useMemo(() => {
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

    const stepText = `${step + 1}/5`;
    const isFinalStep = step === 4;

    // ✅ Step-specific hint (важно: не показываем “Select apartment size” на step 0/1)
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

    // ✅ Left-side subtitle line (under price) should match step
    const leftSub = useMemo(() => {
        if (showPrice) return `inc.VAT • ~${timeText}`;

        // step 0: before service
        if (step === 0) return "Select a service";

        // service chosen but not enough details yet
        if (serviceId && !sizeId) return "Select apartment size";
        if (serviceId && sizeId && !peopleId) return "Select people";

        // fallback
        return hint;
    }, [showPrice, timeText, step, serviceId, sizeId, peopleId, hint]);

    // ✅ Summary strip text
    const summarySubtitle = useMemo(() => {
        if (!serviceId) return "";
        const parts: string[] = [];
        if (sizeId) parts.push(sizeLabel);
        if (peopleId) parts.push(peopleLabel);
        if (hasPets) parts.push("pets");
        return parts.join(" • ");
    }, [serviceId, sizeId, peopleId, sizeLabel, peopleLabel, hasPets]);

    const summaryMeta = useMemo(() => {
        if (!serviceId) return "";
        const extrasText = extrasCount > 0 ? `${extrasCount} extras selected` : "No extras selected";
        return `${extrasText} • step ${stepText}`;
    }, [serviceId, extrasCount, stepText]);

    // ✅ Button hint only when disabled
    const buttonHintText = isFinalStep ? "Complete required fields" : hint;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
            <div className="px-4 md:px-6 pt-3">
                <div className="max-w-4xl mx-auto">
                    {/* ✅ Summary strip is INSIDE footer => always “pressed” to footer */}
                    {serviceId && (
                        <div className="mb-3">
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{service?.name}</div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {summarySubtitle || "Select details"}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{summaryMeta}</div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="font-semibold text-sm whitespace-nowrap">
                                            {showPrice
                                                ? `€ ${total.toFixed(2)}`
                                                : `From € ${service?.startingPrice ?? 0}`}
                                        </div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            {showPrice ? `~${timeText}` : "Select details"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer main row */}
                    <div className="flex items-center justify-between gap-4 pb-2">
                        <div className="flex flex-col min-w-0">
                            {showPrice ? (
                                <>
                                    <div className="text-2xl font-bold whitespace-nowrap">€&nbsp;{total.toFixed(2)}</div>
                                    <div className="text-sm text-gray-500 whitespace-nowrap">{leftSub}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold whitespace-nowrap">
                                        {serviceId ? `From € ${service?.startingPrice ?? 0}` : "From € 0"}
                                    </div>
                                    <div className="text-sm text-gray-500 whitespace-nowrap">{leftSub}</div>
                                </>
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
        </div>
    );
}