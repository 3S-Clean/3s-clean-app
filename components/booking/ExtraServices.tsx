"use client";

import {useMemo} from "react";
import {useTranslations} from "next-intl";
import {useBookingStore} from "@/lib/booking/store";
import {type ExtraId, EXTRAS} from "@/lib/booking/config";
import {useExtrasI18n} from "@/lib/services/useExtrasI18n";
import {isExtraId} from "@/lib/booking/guards";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT, CARD_FRAME_INTERACTIVE,} from "@/components/ui/card/CardFrame";

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
const POPULAR: readonly ExtraId[] = ["linen-double", "linen-single"];

// ✅ same black as BookingFooter / ContactSchedule
const PRIMARY_SOLID = "bg-gray-900 text-white dark:bg-white dark:text-gray-900";
const PRIMARY_HOVER = "hover:bg-gray-800 dark:hover:bg-white/90";

// Selected text helpers (no fill -> keep normal text colors)
const SEL_TEXT = "text-[var(--text)]";
const SEL_MUTED = "text-[var(--muted)]";
const SEL_MUTED_SOFT = "text-[var(--muted)]/70";

export default function ExtraServices() {
    const t = useTranslations("bookingExtras");
    const {getExtraText} = useExtrasI18n();
    const {extras, updateExtra} = useBookingStore();

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
                const {name} = getExtraText(e.id);
                return {id: e.id, q: Number(q) || 0, e, name};
            })
            .filter(Boolean) as Array<{ id: ExtraId; q: number; e: (typeof EXTRAS)[number]; name: string }>;
    }, [extras, getExtraText]);

    const extrasUi = useMemo(() => {
        return EXTRAS.map((extra) => {
            const qty = Number((extras || {})[extra.id] || 0);
            const isSelected = qty > 0;
            const duration = formatDuration(extra.hours);
            const {name, unit} = getExtraText(extra.id);
            const isRec = RECOMMENDED.includes(extra.id);
            const isPop = POPULAR.includes(extra.id);
            return {extra, qty, isSelected, duration, name, unit, isRec, isPop};
        });
    }, [extras, getExtraText]);

    // ✅ Small control buttons: match your “input/card” visibility
    const CONTROL_BTN = [
        "h-10 w-10 rounded-full flex items-center justify-center text-lg",
        "border border-black/10 dark:border-white/10",
        "bg-white/70 dark:bg-[var(--card)]/70 backdrop-blur",
        "text-[var(--text)]",
        "transition-all",
        "hover:ring-1 hover:ring-black/10 dark:hover:ring-white/15",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    ].join(" ");

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {extrasUi.map(({extra, qty, isSelected, duration, name, unit, isRec, isPop}) => (
                    <div
                        key={extra.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => updateExtra(extra.id, 1)} // tap card = +1
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") updateExtra(extra.id, 1);
                        }}
                        className={[
                            // ✅ new card base
                            CARD_FRAME_BASE,
                            CARD_FRAME_INTERACTIVE,
                            "text-left w-full p-4 rounded-3xl",
                            // ✅ only lift when NOT selected (selected should feel “solid”)
                            !isSelected ? CARD_FRAME_HOVER_LIFT : "",
                            // ✅ selected = border only (no fill)
                            isSelected ? "ring-1 ring-gray-900/25 dark:ring-white/25" : "",
                            // ✅ unselected keeps your card token; add a subtle hover ring only
                            !isSelected ? "hover:ring-1 hover:ring-[var(--text)]/10" : "",
                            // ✅ tiny active press
                            "active:scale-[0.995]",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div
                                        className={["font-semibold text-sm truncate", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                                        {name}
                                    </div>

                                    {isPop || isRec ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {isPop && (
                                                <span
                                                    className={[
                                                        "px-2 py-0.5 text-[11px] font-semibold rounded-full border",
                                                        // badge stays subtle always
                                                        "bg-black/5 text-[var(--text)] border-black/10",
                                                        "dark:bg-white/10 dark:text-white dark:border-white/15",
                                                    ].join(" ")}
                                                >
                          {t("badges.popular")}
                        </span>
                                            )}

                                            {isRec && (
                                                <span
                                                    className={[
                                                        "px-2 py-0.5 text-[11px] font-semibold rounded-full border",
                                                        // recommended = primary pill
                                                        PRIMARY_SOLID,
                                                        PRIMARY_HOVER,
                                                        "border-white/10 dark:border-black/10",
                                                    ].join(" ")}
                                                >
                          {t("badges.recommended")}
                        </span>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1">
                  <span
                      className={["font-semibold tabular-nums", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                    +€{extra.price.toFixed(2)}
                  </span>

                                    {duration ? (
                                        <span className={isSelected ? SEL_MUTED : "text-[var(--muted)]"}>
                      {t("adds")} ~{duration}
                    </span>
                                    ) : null}

                                    {unit ? (
                                        <span
                                            className={isSelected ? SEL_MUTED_SOFT : "text-[var(--muted)]/70"}>/ {unit}</span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => updateExtra(extra.id, -1)}
                                    disabled={qty === 0}
                                    className={[
                                        CONTROL_BTN,
                                        qty === 0 ? "opacity-40 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    aria-label={t("aria.decrease", {name})}
                                >
                                    −
                                </button>

                                <div
                                    className={["w-9 text-center font-semibold text-base tabular-nums", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                                    {qty}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => updateExtra(extra.id, 1)}
                                    className={CONTROL_BTN}
                                    aria-label={t("aria.increase", {name})}
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
                    <div className={[CARD_FRAME_BASE, "p-4 rounded-3xl", PRIMARY_SOLID, PRIMARY_HOVER].join(" ")}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold tracking-wide text-white/80 dark:text-gray-700">
                                {t("summary.selectedExtras")}
                            </div>
                            <div className="text-xs text-white/60 dark:text-gray-500">{t("summary.howto")}</div>
                        </div>

                        <div className="space-y-2">
                            {selectedExtras.map(({id, q, e, name}) => (
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

                        <div
                            className="mt-4 pt-4 flex items-center justify-between font-semibold border-t border-white/10 dark:border-black/10">
                            <span className="text-white/70 dark:text-gray-600">{t("summary.total")}</span>
                            <span
                                className="text-white tabular-nums dark:text-gray-900">+€{extrasTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <div
                        className={[CARD_FRAME_BASE, "p-4 rounded-3xl text-sm", PRIMARY_SOLID, PRIMARY_HOVER].join(" ")}>
                        <span className="text-white/80 dark:text-gray-700">{t("summary.empty")}</span>
                    </div>
                )}

                <div className="mt-4 text-xs text-[var(--muted)]">{t("hint")}</div>
            </div>
        </div>
    );
}