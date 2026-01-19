"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { EXTRAS } from "@/lib/booking/config";

export default function ExtraServices() {
    const { extras, updateExtra } = useBookingStore();

    const extrasTotal = useMemo(() => {
        return Object.entries(extras).reduce((sum, [id, qty]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.price * qty : 0);
        }, 0);
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

                    return (
                        <div
                            key={extra.id}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                                isSelected ? "border-gray-900" : "border-gray-200"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                {/* LEFT */}
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">{extra.name}</div>

                                    <div className="flex gap-3 text-sm mt-1">
                    <span className="text-gray-900 font-semibold">
                      €{extra.price.toFixed(2)}
                    </span>

                                        <span className="text-gray-400">
                      ~
                                            {extra.hours >= 1
                                                ? `${extra.hours}h`
                                                : `${Math.round(extra.hours * 60)}min`}
                    </span>

                                        <span className="text-gray-300">/ {extra.unit}</span>
                                    </div>
                                </div>

                                {/* COUNTER */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateExtra(extra.id, -1)}
                                        disabled={qty === 0}
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center text-xl transition-all ${
                                            qty === 0
                                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                                        }`}
                                    >
                                        −
                                    </button>

                                    <span className="w-8 text-center font-semibold text-lg">
                    {qty}
                  </span>

                                    <button
                                        type="button"
                                        onClick={() => updateExtra(extra.id, 1)}
                                        className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xl hover:border-gray-900 hover:text-gray-900 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {extrasTotal > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl animate-fadeIn">
                    <div className="text-sm font-semibold text-gray-400 mb-3">
                        SELECTED EXTRAS:
                    </div>

                    {Object.entries(extras)
                        .filter(([_, q]) => q > 0)
                        .map(([id, q]) => {
                            const e = EXTRAS.find((x) => x.id === id);
                            if (!e) return null;

                            return (
                                <div key={id} className="flex justify-between text-sm mb-2">
                  <span>
                    {e.name} × {q}
                  </span>
                                    <span className="text-gray-900 font-semibold">
                    +€{(e.price * q).toFixed(2)}
                  </span>
                                </div>
                            );
                        })}

                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
                        <span>Extras Total</span>
                        <span className="text-gray-900">
              +€{extrasTotal.toFixed(2)}
            </span>
                    </div>
                </div>
            )}
        </div>
    );
}