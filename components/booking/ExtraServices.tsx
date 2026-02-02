"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/lib/booking/store";
import { EXTRAS, type ExtraId } from "@/lib/booking/config";
import { useExtrasI18n } from "@/lib/services/useExtrasI18n";
import { isExtraId } from "@/lib/booking/guards";

function formatDuration(hours: number) {
    if (!hours || hours <= 0) return "";
    if (hours >= 1) {
        const wh = Math.floor(hours);
        const m = Math.round((hours - wh) * 60);
        if (m === 0) return `${wh}h`;
        return `${wh}h ${m}min`;
    }
    return `${Math.round(hours * 60)}min`;
}

/** ✅ only 2 recommended */
const RECOMMENDED: readonly ExtraId[] = ["windows-outside", "windows-inside", "sofa"];
const POPULAR: readonly ExtraId[] = ["linen-double","linen-single"];


// ✅ same black as BookingFooter / ContactSchedule
const PRIMARY_SOLID = "bg-gray-900 text-white dark:bg-white dark:text-gray-900";
const PRIMARY_HOVER = "hover:bg-gray-800 dark:hover:bg-white/90";
const SEL_TEXT = "text-white dark:text-gray-900";
const SEL_MUTED = "text-white/70 dark:text-gray-600";
const SEL_MUTED_SOFT = "text-white/55 dark:text-gray-500";

export default function ExtraServices() {
    const t = useTranslations("bookingExtras");
    const { getExtraText } = useExtrasI18n();
    const { extras, updateExtra } = useBookingStore();

    const extrasTotal = useMemo(() => {
        return Object.entries(extras || {}).reduce((sum, [id, qty]) => {
            if (!isExtraId(id)) return sum;
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.price * (Number(qty) || 0) : 0);
        }, 0);
    }, [extras]);

    const selectedExtras = useMemo(() => {
        return Object.entries(extras || {})
            .filter(([id, q]) => isExtraId(id) && (Number(q) || 0) > 0)
            .map(([id, q]) => {
                const e = EXTRAS.find((x) => x.id === id);
                if (!e) return null;

                const { name } = getExtraText(e.id);
                return { id: e.id, q: Number(q) || 0, e, name };
            })
            .filter(Boolean) as Array<{ id: ExtraId; q: number; e: (typeof EXTRAS)[number]; name: string }>;
    }, [extras, getExtraText]);

    const extrasUi = useMemo(() => {
        return EXTRAS.map((extra) => {
            const qty = Number((extras || {})[extra.id] || 0);
            const isSelected = qty > 0;
            const duration = formatDuration(extra.hours);
            const { name, unit } = getExtraText(extra.id);
            const isRec = RECOMMENDED.includes(extra.id);
            const isPop = POPULAR.includes(extra.id);

            return { extra, qty, isSelected, duration, name, unit, isRec, isPop };
        });
    }, [extras, getExtraText]);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {extrasUi.map(({ extra, qty, isSelected, duration, name, unit, isRec, isPop }) => (
                    <div
                        key={extra.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => updateExtra(extra.id, 1)} // tap card = +1
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") updateExtra(extra.id, 1);
                        }}
                        className={[
                            "text-left w-full p-4 rounded-2xl transition-all cursor-pointer select-none",
                            "focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                            "active:scale-[0.995]",
                            isSelected
                                ? "bg-gray-900 text-white border border-black/10 dark:bg-white dark:text-gray-900 dark:border-black/10"
                                : "bg-[var(--card)]/70 backdrop-blur-md border border-black/10 dark:border-white/10",
                            isSelected ? "ring-1 ring-[var(--text)]/20" : "hover:ring-1 hover:ring-[var(--text)]/10",
                        ].join(" ")}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className={["font-semibold text-sm truncate", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                                        {name}
                                    </div>
                                    {(isPop || isRec) ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {isPop && (
                                                <span
                                                    className={[
                                                        "px-2 py-0.5 text-[11px] font-semibold rounded-full border",
                                                        "bg-gray-900/10 text-gray-900 border-black/10",
                                                        "dark:bg-white/15 dark:text-white dark:border-white/15",
                                                    ].join(" ")}
                                                >
                                                {t("badges.popular")}
                                              </span>
                                            )}
                                            {isRec && (
                                                <span
                                                    className={[
                                                        "px-2 py-0.5 text-[11px] font-semibold rounded-full border transition",
                                                        PRIMARY_SOLID,
                                                        PRIMARY_HOVER,
                                                        "border-white/10",
                                                    ].join(" ")}
                                                >
                                                {t("badges.recommended")}
                                              </span>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1">
                 <span className={["font-semibold tabular-nums", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                    +€{extra.price.toFixed(2)}
                  </span>
                                    {duration ? (
                                        <span className={isSelected ? SEL_MUTED : "text-[var(--muted)]"}>
                                    {t("adds")} ~{duration}
                                        </span>
                                    ) : null}

                                    {unit ?
                                        <span className={isSelected ? SEL_MUTED_SOFT : "text-[var(--muted)]/70"}>/ {unit}
                                        </span> : null}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => updateExtra(extra.id, -1)}
                                    disabled={qty === 0}
                                    className={[
                                        "w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all",
                                        "bg-[var(--background)]/60 backdrop-blur",
                                        "border-black/10 dark:border-white/10",
                                        qty === 0
                                            ? "text-[var(--muted)]/50 cursor-not-allowed"
                                            : "text-[var(--text)] hover:ring-1 hover:ring-[var(--text)]/15",
                                    ].join(" ")}
                                    aria-label={t("aria.decrease", { name })}
                                >
                                    −
                                </button>

                                <div className={["w-9 text-center font-semibold text-base tabular-nums", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                                    {qty}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => updateExtra(extra.id, 1)}
                                    className={[
                                        "w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all",
                                        "bg-[var(--background)]/60 backdrop-blur",
                                        "border-black/10 dark:border-white/10",
                                        "text-[var(--text)] hover:ring-1 hover:ring-[var(--text)]/15",
                                    ].join(" ")}
                                    aria-label={t("aria.increase", { name })}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary (same color as Continue button) */}
            <div className="mt-8">
                {extrasTotal > 0 ? (
                    <div className={["p-4 rounded-2xl animate-fadeIn transition", PRIMARY_SOLID, PRIMARY_HOVER].join(" ")}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold tracking-wide text-white/80 dark:text-gray-700">
                                {t("summary.selectedExtras")}
                            </div>
                            <div className="text-xs text-white/60 dark:text-gray-500">
                                {t("summary.howto")}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {selectedExtras.map(({ id, q, e, name }) => (
                                <div key={id} className="flex items-center justify-between text-sm">
                                    <div className="truncate pr-3 text-white/85 dark:text-gray-900">
                                        {name} <span className="text-white/50 dark:text-gray-500">× {q}</span>
                                    </div>
                                    <div className="font-semibold tabular-nums text-white dark:text-gray-900">
                                        +€{(e.price * q).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 flex items-center justify-between font-semibold border-t border-white/10 dark:border-black/10">
                            <span className="text-white/70 dark:text-gray-600">{t("summary.total")}</span>
                            <span className="text-white tabular-nums dark:text-gray-900">+€{extrasTotal.toFixed(2)}</span>
                            </div>
                    </div>
                ) : (
                    // ✅ EMPTY STATE — тот же цвет, что Continue
                        <div
                         className={[
                             "p-4 rounded-2xl animate-fadeIn transition text-sm",
                             PRIMARY_SOLID,
                             PRIMARY_HOVER,
                            ].join(" ")}
                         >
                             <span className="text-white/80 dark:text-gray-700">
                                {t("summary.empty")}
                              </span>
                        </div>
                )}
                <div className="mt-4 text-xs text-[var(--muted)]">{t("hint")}</div>
            </div>
        </div>
    );
}