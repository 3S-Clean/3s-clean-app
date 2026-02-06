"use client";

import {useMemo} from "react";
import {useTranslations} from "next-intl";
import {useBookingStore} from "@/lib/booking/store";
import {useBookingNavigation} from "@/lib/booking/useBookingNavigation";
import {
    APARTMENT_SIZES,
    type ApartmentSizeId,
    EXTRAS,
    FINAL_PRICES,
    getEstimatedHours,
    PEOPLE_OPTIONS,
    type PeopleCountId,
    type ServiceId,
    SERVICES,
} from "@/lib/booking/config";
import {isApartmentSizeId, isExtraId, isPeopleCountId, isServiceId} from "@/lib/booking/guards";
import {CARD_FRAME_BASE} from "@/components/ui/card/CardFrame";

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

export default function BookingFooter({onSubmit, isSubmitting}: Props) {
    const t = useTranslations("bookingFooter.footer");
    const tServices = useTranslations("services");

    const {step, canContinue, next, back} = useBookingNavigation();
    const {selectedService, apartmentSize, peopleCount, hasPets, extras} = useBookingStore();

    const serviceId: ServiceId | null =
        selectedService && isServiceId(selectedService) ? selectedService : null;
    const sizeId: ApartmentSizeId | null =
        apartmentSize && isApartmentSizeId(apartmentSize) ? apartmentSize : null;
    const peopleId: PeopleCountId | null =
        peopleCount && isPeopleCountId(peopleCount) ? peopleCount : null;

    const serviceTitle = useMemo(() => {
        if (!serviceId) return t("summary.fallbackService");
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

        const base =
            FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[hasPets ? "pet" : "noPet"] ?? 0;

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
            extrasCount > 0
                ? t("summary.extrasSelected", {count: extrasCount})
                : t("summary.noExtras");
        return t("summary.meta", {extras: extrasText, step: `${step + 1}/5`});
    }, [serviceId, extrasCount, step, t]);

    const fromPriceValue = useMemo(() => {
        if (!serviceId) return "0";
        return String(SERVICES.find((s) => s.id === serviceId)?.startingPrice ?? 0);
    }, [serviceId]);

    /* ---------------- Glass buttons (final) ---------------- */

    const backBtn =
        "px-5 md:px-8 py-3 rounded-full font-medium transition-all " +
        "bg-white/45 backdrop-blur-md text-gray-900 " +
        "border border-black/6 " +
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] " +
        "[@media(hover:hover)]:hover:bg-white/55 " +
        "active:scale-[0.985] " +
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10 " +
        "dark:bg-[var(--card)]/40 dark:text-white dark:border-white/12 " +
        "dark:focus-visible:ring-white/12";

    const primaryBtn =
        "px-5 md:px-8 py-3 rounded-full font-semibold transition-all " +
        "bg-white/55 backdrop-blur-md text-gray-900 " +
        "border border-black/8 " +
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] " +
        "[@media(hover:hover)]:hover:bg-white/65 " +
        "active:scale-[0.985] " +
        "disabled:opacity-40 disabled:cursor-not-allowed " +
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10 " +
        "dark:bg-[var(--card)]/55 dark:text-white dark:border-white/18 " +
        "dark:focus-visible:ring-white/12";

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white dark:bg-black dark:border-white/10"
            style={{paddingBottom: "calc(16px + env(safe-area-inset-bottom))"}}
        >
            <div className="px-4 md:px-6 pt-3">
                <div className="max-w-4xl mx-auto">
                    {serviceId && (
                        <div className="mb-3">
                            <div className={[CARD_FRAME_BASE, "px-4 py-3"].join(" ")}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{serviceTitle}</div>
                                        <div className="text-xs text-gray-600 truncate dark:text-white/70">
                                            {summarySubtitle}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 dark:text-white/50">
                                            {summaryMeta}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="font-semibold text-sm whitespace-nowrap">
                                            {showPrice
                                                ? t("summary.total", {value: total.toFixed(2)})
                                                : t("summary.from", {
                                                    value:
                                                        SERVICES.find((s) => s.id === serviceId)?.startingPrice ?? 0,
                                                })}
                                        </div>
                                        <div className="text-xs text-gray-600 whitespace-nowrap dark:text-white/70">
                                            {showPrice
                                                ? t("summary.time", {time: timeText})
                                                : t("summary.selectDetails")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pb-2">
                        <div className="flex flex-col min-w-0">
                            <div className="text-base md:text-lg font-medium text-gray-800 dark:text-white">
                                {showPrice
                                    ? t("price", {value: total.toFixed(2)})
                                    : t("fromPrice", {value: fromPriceValue})}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-white/60">
                                {showPrice ? t("sub.incVatTime", {time: timeText}) : ""}
                            </div>
                        </div>

                        <div className="flex gap-2 md:gap-3 shrink-0">
                            {step > 0 && (
                                <button onClick={back} className={backBtn}>
                                    {t("back")}
                                </button>
                            )}

                            {step === 4 ? (
                                <button
                                    onClick={() => onSubmit?.()}
                                    disabled={!canContinue || isSubmitting}
                                    className={primaryBtn}
                                >
                                    {isSubmitting ? t("booking") : t("bookNow")}
                                </button>
                            ) : (
                                <button
                                    onClick={next}
                                    disabled={!canContinue}
                                    className={primaryBtn}
                                >
                                    {t("continue")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}