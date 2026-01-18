"use client";

import { useBookingStore } from "@/lib/booking/store";
import { EXTRAS } from "@/lib/booking/config";

export default function ExtraServices() {
    const { extras, updateExtra } = useBookingStore();

    // Calculate totals for selected extras
    const selectedExtras = Object.entries(extras).filter(([, qty]) => qty > 0);

    const totalExtrasPrice = selectedExtras.reduce((sum, [id, qty]) => {
        const extra = EXTRAS.find((e) => e.id === id);
        return sum + (extra ? extra.price * qty : 0);
    }, 0);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Extra Services</h1>
                <p className="text-gray-500">
                    Add optional services to customize your cleaning experience
                </p>
            </div>

            {/* Extra Services List */}
            <div className="flex flex-col gap-3">
                {EXTRAS.map((extra) => {
                    const quantity = extras[extra.id] || 0;
                    const isSelected = quantity > 0;

                    return (
                        <div
                            key={extra.id}
                            className={`
                p-5 rounded-2xl bg-white flex items-center justify-between transition-all
                ${isSelected ? "ring-2 ring-gray-900" : "border border-gray-200"}
              `}
                        >
                            {/* Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <span className="text-3xl">{extra.icon}</span>
                                <div className="flex-1">
                                    <div className="font-semibold mb-1">{extra.name}</div>
                                    <div className="flex gap-3 text-sm">
                    <span className="text-green-600 font-semibold">
                      €{extra.price.toFixed(2)}
                    </span>
                                        <span className="text-gray-400">
                      ~
                                            {extra.hours >= 1
                                                ? `${extra.hours}h`
                                                : `${Math.round(extra.hours * 60)}min`}
                    </span>
                                        <span className="text-gray-400">/ {extra.unit}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateExtra(extra.id, -1)}
                                    disabled={quantity === 0}
                                    className={`
                    w-9 h-9 rounded-full border flex items-center justify-center text-lg transition-all
                    ${
                                        quantity === 0
                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                            : "border-gray-300 text-gray-600 hover:border-gray-900 hover:bg-gray-50"
                                    }
                  `}
                                >
                                    −
                                </button>

                                <span className="w-8 text-center text-lg font-semibold">
                  {quantity}
                </span>

                                <button
                                    onClick={() => updateExtra(extra.id, 1)}
                                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:border-gray-900 hover:bg-gray-50 transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Extras Summary */}
            {selectedExtras.length > 0 && (
                <div className="mt-6 p-5 bg-gray-100 rounded-2xl">
                    <div className="text-sm font-semibold text-gray-500 mb-3">
                        SELECTED EXTRAS:
                    </div>

                    {selectedExtras.map(([id, qty]) => {
                        const extra = EXTRAS.find((e) => e.id === id);
                        if (!extra) return null;

                        return (
                            <div key={id} className="flex justify-between text-sm mb-2">
                <span>
                  {extra.name} × {qty}
                </span>
                                <span className="text-green-600 font-semibold">
                  +€{(extra.price * qty).toFixed(2)}
                </span>
                            </div>
                        );
                    })}

                    <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between font-semibold">
                        <span>Extras Total</span>
                        <span className="text-green-600">
              +€{totalExtrasPrice.toFixed(2)}
            </span>
                    </div>
                </div>
            )}
        </div>
    );
}