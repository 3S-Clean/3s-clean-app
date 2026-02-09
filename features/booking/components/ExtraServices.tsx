"use client";

import {useMemo} from "react";
import {useTranslations} from "next-intl";
import {useBookingStore} from "@/features/booking/lib/store";
import {type ExtraId, EXTRAS} from "@/features/booking/lib/config";
import {useExtrasI18n} from "@/features/booking/lib/useExtrasI18n";
import {isExtraId} from "@/features/booking/lib/guards";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT, CARD_FRAME_INTERACTIVE,} from "@/shared/ui";

/** ✅ only 2 recommended */
const RECOMMENDED: readonly ExtraId[] = ["windows-outside", "windows-inside", "sofa"];
const POPULAR: readonly ExtraId[] = ["linen-double", "linen-single"];

// Selected text helpers
const SEL_TEXT = "text-[var(--text)]";
const SEL_MUTED_SOFT = "text-[var(--muted)]/70";

const SELECTABLE_CARD_BASE = [
    CARD_FRAME_BASE,
    CARD_FRAME_INTERACTIVE,
    "appearance-none",
    "[-webkit-tap-highlight-color:transparent]",
].join(" ");

const SELECTED_CARD_CLASS = [
    "!ring-2 !ring-inset !ring-black/14 dark:!ring-white/18 !ring-offset-0",
].join(" ");

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
            .filter(Boolean) as Array<{
            id: ExtraId;
            q: number;
            e: (typeof EXTRAS)[number];
            name: string;
        }>;
    }, [extras, getExtraText]);

    const extrasUi = useMemo(() => {
        return EXTRAS.map((extra) => {
            const qty = Number((extras || {})[extra.id] || 0);
            const isSelected = qty > 0;
            const {name, unit} = getExtraText(extra.id);
            const isRec = RECOMMENDED.includes(extra.id);
            const isPop = POPULAR.includes(extra.id);
            return {extra, qty, isSelected, name, unit, isRec, isPop};
        });
    }, [extras, getExtraText]);

    const CONTROL_BTN = [
        "h-10 w-10 rounded-full flex items-center justify-center text-lg",
        "border border-black/10 dark:border-white/12",
        "bg-white/70 dark:bg-[var(--card)]/70 backdrop-blur",
        "text-[var(--text)]",
        "transition-all",
        "hover:ring-1 hover:ring-black/10 dark:hover:ring-white/12",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    ].join(" ");

    const SUMMARY_CARD = [
        CARD_FRAME_BASE,
        "p-4 rounded-3xl",
        "border border-black/8 dark:border-white/10",
    ].join(" ");

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-3">
                {extrasUi.map(({extra, qty, isSelected, name, unit, isRec, isPop}) => (
                    <div
                        key={extra.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            if (!isSelected) updateExtra(extra.id, 1);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (!isSelected) updateExtra(extra.id, 1);
                            }
                        }}
                        className={[
                            SELECTABLE_CARD_BASE,
                            "text-left w-full p-4 rounded-3xl",
                            "outline-none focus:outline-none",
                            "focus-visible:ring-2 focus-visible:ring-[var(--text)]/10 dark:focus-visible:ring-white/15",
                            "focus-visible:ring-offset-0",
                            "[-webkit-tap-highlight-color:transparent]",
                            !isSelected ? CARD_FRAME_HOVER_LIFT : "",

                            // ✅ unified selected style
                            isSelected ? SELECTED_CARD_CLASS : "",

                            "transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]",
                            "active:scale-[0.995]",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div
                                        className={[
                                            "font-semibold text-sm truncate",
                                            isSelected ? SEL_TEXT : "text-[var(--text)]",
                                        ].join(" ")}
                                    >
                                        {name}
                                    </div>

                                    {isPop || isRec ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {isPop && (
                                                <span
                                                    className="px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-black/5 text-[var(--text)] border-black/10 dark:bg-white/10 dark:text-white dark:border-white/15">
                          {t("badges.popular")}
                        </span>
                                            )}

                                            {isRec && (
                                                <span
                                                    className="px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-white/70 backdrop-blur text-[var(--text)] border-black/10 dark:bg-[var(--card)]/70 dark:text-white dark:border-white/15">
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

                                    {unit && (
                                        <span className={isSelected ? SEL_MUTED_SOFT : "text-[var(--muted)]/70"}>
                      / {unit}
                    </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => updateExtra(extra.id, -1)}
                                    disabled={qty === 0}
                                    className={[CONTROL_BTN, qty === 0 ? "opacity-40 cursor-not-allowed" : ""].join(" ")}
                                >
                                    −
                                </button>

                                <div
                                    className={["w-9 text-center font-semibold text-base tabular-nums", isSelected ? SEL_TEXT : "text-[var(--text)]"].join(" ")}>
                                    {qty}
                                </div>

                                <button type="button" onClick={() => updateExtra(extra.id, 1)} className={CONTROL_BTN}>
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                {extrasTotal > 0 ? (
                    <div className={SUMMARY_CARD}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold tracking-wide text-[var(--text)]/80">
                                {t("summary.selectedExtras")}
                            </div>
                            <div className="text-xs text-[var(--muted)]">{t("summary.howto")}</div>
                        </div>

                        <div className="space-y-2">
                            {selectedExtras.map(({id, q, e, name}) => (
                                <div key={id} className="flex items-center justify-between text-sm">
                                    <div className="truncate pr-3 text-[var(--text)]">
                                        {name} <span className="text-[var(--muted)]">× {q}</span>
                                    </div>
                                    <div className="font-semibold tabular-nums text-[var(--text)]">
                                        +€{(e.price * q).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            className="mt-4 pt-4 flex items-center justify-between font-semibold border-t border-black/5 dark:border-white/10">
                            <span className="text-[var(--muted)]">{t("summary.total")}</span>
                            <span className="text-[var(--text)] tabular-nums">+€{extrasTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <div className={[SUMMARY_CARD, "text-sm"].join(" ")}>
                        <span className="text-[var(--muted)]">{t("summary.empty")}</span>
                    </div>
                )}

                <div className="mt-4 text-xs text-[var(--muted)]">{t("hint")}</div>
            </div>
        </div>
    );
}
