"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/lib/booking/store";
import { useBookingNavigation } from "@/lib/booking/useBookingNavigation";
import {
    SERVICES,
    FINAL_PRICES,
    EXTRAS,
    getEstimatedHours,
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";
import { AnimatePresence, motion } from "framer-motion";
import { isServiceId, isApartmentSizeId, isPeopleCountId, isExtraId } from "@/lib/booking/guards";

interface Props {
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

function formatDuration(hours: number) {
    if (!hours || hours <= 0) return "";
    const wh = Math.floor(hours);
    const m = Math.round((hours - wh) * 60);
    if (m === 0) return `${wh}h`;
    if (wh === 0) return `${m}min`;
    return `${wh}h ${m}min`;
}

export default function BookingFooter({ onSubmit, isSubmitting }: Props) {
    const t = useTranslations("bookingFooter.footer");
    const tServices = useTranslations("services"); // ✅ сервисы лежат в корне "services.*"

    const { step, canContinue, next, back } = useBookingNavigation();
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } = useBookingStore();

    const serviceId: ServiceId | null =
        selectedService && isServiceId(selectedService) ? selectedService : null;
    const sizeId: ApartmentSizeId | null =
        apartmentSize && isApartmentSizeId(apartmentSize) ? apartmentSize : null;
    const peopleId: PeopleCountId | null =
        peopleCount && isPeopleCountId(peopleCount) ? peopleCount : null;

    const serviceTitle = useMemo(() => {
        if (!serviceId) return t("summary.fallbackService");
        // ✅ было: t(`services.${serviceId}.title`) (не тот namespace)
        return tServices(`${serviceId}.title`);
    }, [serviceId, t, tServices]);

    const sizeLabel = useMemo(
        () => (sizeId ? APARTMENT_SIZES.find((s) => s.id === sizeId)?.label ?? "" : ""),
        [sizeId]
    );

    const peopleLabel = useMemo(
        () => (peopleId ? PEOPLE_OPTIONS.find((p) => p.id === peopleId)?.label ?? "" : ""),
        [peopleId]
    );

    const extrasCount = useMemo(() => {
        return Object.entries(extras || {}).reduce((sum, [id, q]) => {
            if (!isExtraId(id)) return sum;
            return sum + (Number(q) || 0);
        }, 0);
    }, [extras]);

    const showPrice = Boolean(serviceId && sizeId && peopleId);

    const total = useMemo(() => {
        if (!showPrice || !serviceId || !sizeId || !peopleId) return 0;

        const base = FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

        const ext = Object.entries(extras || {}).reduce((s, [id, q]) => {
            if (!isExtraId(id)) return s;
            const e = EXTRAS.find((x) => x.id === id);
            return s + (e ? e.price * (Number(q) || 0) : 0);
        }, 0);

        return base + ext;
    }, [showPrice, sizeId, serviceId, peopleId, hasPets, extras]);

    const timeText = useMemo(() => {
        if (!serviceId || !sizeId) return "";
        let h = getEstimatedHours(serviceId, sizeId);

        Object.entries(extras || {}).forEach(([id, qRaw]) => {
            if (!isExtraId(id)) return;
            const q = Number(qRaw) || 0;
            const e = EXTRAS.find((x) => x.id === id);
            if (e && q > 0) h += e.hours * q;
        });

        return formatDuration(h);
    }, [serviceId, sizeId, extras]);

    const stepText = `${step + 1}/5`;
    const isFinalStep = step === 4;

    const hint = useMemo(() => {
        switch (step) {
            case 0:
                return t("hint.service");
            case 1:
                return t("hint.postcode");
            case 2:
                return t("hint.details");
            case 3:
                return t("hint.extras");
            case 4:
                return t("hint.contact");
            default:
                return t("hint.continue");
        }
    }, [step, t]);

    const leftSub = useMemo(() => {
        if (showPrice) return t("sub.incVatTime", { time: timeText });

        if (step === 0) return t("hint.service");
        if (serviceId && !sizeId) return t("sub.pickSize");
        if (serviceId && sizeId && !peopleId) return t("sub.pickPeople");

        return hint;
    }, [showPrice, timeText, step, serviceId, sizeId, peopleId, hint, t]);

    const summarySubtitle = useMemo(() => {
        if (!serviceId) return "";
        const parts: string[] = [];
        if (sizeLabel) parts.push(sizeLabel);
        if (peopleLabel) parts.push(peopleLabel);
        if (hasPets) parts.push(t("summary.pets"));
        return parts.join(" • ");
    }, [serviceId, sizeLabel, peopleLabel, hasPets, t]);

    const summaryMeta = useMemo(() => {
        if (!serviceId) return "";
        const extrasText =
            extrasCount > 0 ? t("summary.extrasSelected", { count: extrasCount }) : t("summary.noExtras");
        return t("summary.meta", { extras: extrasText, step: stepText });
    }, [serviceId, extrasCount, stepText, t]);

    const buttonHintText = isFinalStep ? t("buttonHint.final") : hint;

    // ✅ ВАЖНО: старый цвет (как было) — НЕ ТРОГАЮ
    const primaryBtn =
        "px-5 md:px-8 py-3 bg-gray-900 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-white/90 dark:disabled:bg-white/50";

    const fromPriceValue = useMemo(() => {
        // чтобы next-intl не ругался на number — всегда строка
        if (!serviceId) return "0";
        return String(SERVICES.find((s) => s.id === serviceId)?.startingPrice ?? 0);
    }, [serviceId]);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-black dark:border-white/10"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
            <div className="px-4 md:px-6 pt-3">
                <div className="max-w-4xl mx-auto">
                    {/* ✅ Summary strip: в цвет кнопки Continue */}
                    {serviceId && (
                        <div className="mb-3">
                            <div className="rounded-2xl bg-gray-900 text-white px-4 py-3 shadow-sm dark:bg-white dark:text-gray-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{serviceTitle}</div>
                                        <div className="text-xs text-white/70 truncate dark:text-gray-600">
                                            {summarySubtitle || t("summary.selectDetails")}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1 dark:text-gray-500">{summaryMeta}</div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="font-semibold text-sm whitespace-nowrap">
                                            {showPrice
                                                ? t("summary.total", { value: total.toFixed(2) })
                                                : t("summary.from", {
                                                    value: SERVICES.find((s) => s.id === serviceId)?.startingPrice ?? 0,
                                                })}
                                        </div>
                                        <div className="text-xs text-white/70 whitespace-nowrap dark:text-gray-600">
                                            {showPrice
                                                ? t("summary.time", { time: timeText })
                                                : t("summary.selectDetails")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer main row */}
                    <div className="flex items-center justify-between gap-4 pb-2">
                        <div className="flex flex-col min-w-0">
                            <div className="text-2xl font-bold whitespace-nowrap text-gray-900 dark:text-white">
                                {showPrice
                                    ? t("price", { value: total.toFixed(2) })
                                    : t("fromPrice", { value: fromPriceValue })}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-white/60 whitespace-nowrap">
                                {leftSub}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex gap-2 md:gap-3 shrink-0">
                                {step > 0 && (
                                    <button
                                        onClick={back}
                                        className="px-5 md:px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all dark:bg-white dark:text-gray-900 dark:border-black/10 dark:hover:bg-white/90"
                                    >
                                        {t("back")}
                                    </button>
                                )}

                                {isFinalStep ? (
                                    <button
                                        onClick={() => onSubmit?.()}
                                        disabled={!canContinue || isSubmitting}
                                        className={primaryBtn}
                                    >
                                        {isSubmitting ? t("booking") : t("bookNow")}
                                    </button>
                                ) : (
                                    <button onClick={next} disabled={!canContinue} className={primaryBtn}>
                                        {t("continue")}
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
                                        className="text-xs text-gray-500 dark:text-white/50 pr-1"
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