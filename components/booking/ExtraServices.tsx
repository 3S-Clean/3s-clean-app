"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { EXTRAS } from "@/lib/booking/config";

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

function getBadge(extraId: string) {
    // Based on YOUR config ids
    const recommended = new Set([
        "oven",
        "fridge",
        "freezer",
        "windows-inside",
        "windows-outside",
        "balcony",
        "limescale",
    ]);

    const popular = new Set([
        "linen-single",
        "linen-double",
        "fridge",
        "windows-inside",
        "sofa",
    ]);

    return { rec: recommended.has(extraId), pop: popular.has(extraId) };
}

export default function ExtraServices() {
    const { extras, updateExtra } = useBookingStore();

    const extrasTotal = useMemo(() => {
        return Object.entries(extras).reduce((sum, [id, qty]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.price * (Number(qty) || 0) : 0);
        }, 0);
    }, [extras]);

    const selectedExtras = useMemo(() => {
        return Object.entries(extras)
            .filter(([_, q]) => (Number(q) || 0) > 0)
            .map(([id, q]) => {
                const e = EXTRAS.find((x) => x.id === id);
                return e ? { id, q: Number(q) || 0, e } : null;
            })
            .filter(Boolean) as Array<{ id: string; q: number; e: (typeof EXTRAS)[number] }>;
    }, [extras]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Extra Services</h1>
                <p className="text-gray-500">Add optional services to your cleaning</p>
            </div>

            <div className="flex flex-col gap-3">
                {EXTRAS.map((extra) => {
                    const qty = extras[extra.id] || 0;
                    const isSelected = qty > 0;
                    const duration = formatDuration(extra.hours);
                    const { rec, pop } = getBadge(extra.id);

                    return (
                        <button
                            key={extra.id}
                            type="button"
                            onClick={() => updateExtra(extra.id, 1)} // tap card = +1
                            className={[
                                "text-left w-full p-4 rounded-2xl border-2 transition-all",
                                "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10",
                                isSelected ? "border-gray-900 bg-gray-50/60" : "border-gray-200 bg-white",
                                "hover:border-gray-300",
                                "active:scale-[0.995]",
                            ].join(" ")}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-sm text-gray-900 truncate">
                                            {extra.name}
                                        </div>

                                        {rec && (
                                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-900 text-white">
                        Recommended
                      </span>
                                        )}
                                        {!rec && pop && (
                                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        Popular
                      </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1">
                                        <span className="text-gray-900 font-semibold">+€{extra.price.toFixed(2)}</span>
                                        {duration ? <span className="text-gray-500">adds ~{duration}</span> : null}
                                        {extra.unit ? <span className="text-gray-400">/ {extra.unit}</span> : null}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()} // prevent card click
                                >
                                    <button
                                        type="button"
                                        onClick={() => updateExtra(extra.id, -1)}
                                        disabled={qty === 0}
                                        className={[
                                            "w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all",
                                            qty === 0
                                                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
                                                : "border-gray-300 text-gray-800 hover:border-gray-900 bg-white",
                                        ].join(" ")}
                                        aria-label={`Decrease ${extra.name}`}
                                    >
                                        −
                                    </button>

                                    <div className="w-9 text-center font-semibold text-base tabular-nums">
                                        {qty}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => updateExtra(extra.id, 1)}
                                        className="w-10 h-10 rounded-full border border-gray-300 text-gray-800 flex items-center justify-center text-lg hover:border-gray-900 transition-all bg-white"
                                        aria-label={`Increase ${extra.name}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8">
                {extrasTotal > 0 ? (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold text-gray-500 tracking-wide">
                                SELECTED EXTRAS
                            </div>
                            <div className="text-xs text-gray-400">
                                Tap card to add • Use − to remove
                            </div>
                        </div>

                        <div className="space-y-2">
                            {selectedExtras.map(({ id, q, e }) => (
                                <div key={id} className="flex items-center justify-between text-sm">
                                    <div className="text-gray-700 truncate pr-3">
                                        {e.name} <span className="text-gray-400">× {q}</span>
                                    </div>
                                    <div className="text-gray-900 font-semibold tabular-nums">
                                        +€{(e.price * q).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-between font-semibold">
                            <span className="text-gray-700">Extras Total</span>
                            <span className="text-gray-900 tabular-nums">+€{extrasTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        No extras selected yet. You can add them anytime.
                    </div>
                )}

                <div className="mt-4 text-xs text-gray-400">
                    You can adjust extras later if needed — no stress.
                </div>
            </div>
        </div>
    );
}