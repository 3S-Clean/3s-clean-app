"use client";

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

    const total = (() => {
        if (!serviceId || !sizeId || !peopleId) return 0;

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const ext = Object.entries(extras || {}).reduce((s, [id, q]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return s + (e ? e.price * (Number(q) || 0) : 0);
        }, 0);

        return base + ext;
    })();

    const time = (() => {
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
    })();

    const service = SERVICES.find((s) => s.id === selectedService);
    const showPrice = Boolean(serviceId && sizeId && peopleId);

    const hint = (() => {
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
    })();

    const isFinalStep = step === 4;

    // ✅ primary disabled state (we DO NOT use the HTML disabled attribute on iOS)
    const primaryBlocked = !canContinue || Boolean(isSubmitting);
    const buttonHintText = isFinalStep ? "Complete required fields" : hint;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
            // extra safety: don't let taps bubble to underlying page
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClickCapture={(e) => e.stopPropagation()}
        >
            <div className="px-4 md:px-6 pt-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0">
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
                            <div className="text-sm text-gray-500">{hint}</div>
                        )}
                    </div>

                    {/* Right side: buttons + hint under primary button */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex gap-2 md:gap-3 shrink-0">
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => back()}
                                    className="px-5 md:px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                            )}

                            {isFinalStep ? (
                                <button
                                    type="button"
                                    aria-disabled={primaryBlocked}
                                    onClick={() => {
                                        if (primaryBlocked) return; // ✅ blocks tap without disabled="true"
                                        onSubmit?.();
                                    }}
                                    className={[
                                        "px-5 md:px-8 py-3 font-semibold rounded-full transition-all",
                                        primaryBlocked
                                            ? "bg-gray-300 text-white cursor-not-allowed"
                                            : "bg-gray-900 text-white hover:bg-gray-800",
                                    ].join(" ")}
                                >
                                    {isSubmitting ? "Booking..." : "Book now"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    aria-disabled={primaryBlocked}
                                    onClick={() => {
                                        if (primaryBlocked) return;
                                        next();
                                    }}
                                    className={[
                                        "px-5 md:px-8 py-3 font-semibold rounded-full transition-all",
                                        primaryBlocked
                                            ? "bg-gray-300 text-white cursor-not-allowed"
                                            : "bg-gray-900 text-white hover:bg-gray-800",
                                    ].join(" ")}
                                >
                                    Continue
                                </button>
                            )}
                        </div>

                        {/* ✅ Button hint (appears only when blocked) */}
                        <AnimatePresence initial={false}>
                            {primaryBlocked && !isSubmitting && (
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