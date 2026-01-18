"use client";

import { useMemo } from "react";
import { EXTRAS } from "@/lib/booking/config";
import { useBookingStore } from "@/lib/booking/store";
import {
    Minus,
    Plus,
    Bed,
    BedDouble,
    Flame,
    Refrigerator,
    Snowflake,
    AppWindow,
    Trees,
    Droplets,
    Archive,
    Shirt,
    Sofa,
    Package,
    type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
    "bed-single": Bed,
    "bed-double": BedDouble,
    flame: Flame,
    refrigerator: Refrigerator,
    snowflake: Snowflake,
    "app-window": AppWindow,
    trees: Trees,
    droplets: Droplets,
    archive: Archive,
    shirt: Shirt,
    sofa: Sofa,
};

function ExtraIcon({ iconKey }: { iconKey: string }) {
    const Icon = ICON_MAP[iconKey] ?? Package;
    return <Icon className="h-5 w-5 text-black/70" />;
}

export default function ExtraServices() {
    const { extras, updateExtra, nextStep, prevStep } = useBookingStore();

    const extrasTotal = useMemo(() => {
        return Object.entries(extras || {}).reduce((sum, [id, qtyRaw]) => {
            const qty = Number(qtyRaw) || 0;
            if (qty <= 0) return sum;
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.price * qty : 0);
        }, 0);
    }, [extras]);

    const selectedLines = useMemo(() => {
        return Object.entries(extras || {})
            .map(([id, qtyRaw]) => {
                const qty = Number(qtyRaw) || 0;
                if (qty <= 0) return null;
                const e = EXTRAS.find((x) => x.id === id);
                if (!e) return null;
                return { id, name: e.name, qty, line: e.price * qty };
            })
            .filter(Boolean) as Array<{ id: string; name: string; qty: number; line: number }>;
    }, [extras]);

    return (
        <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Extras</h2>
            <p className="mt-2 text-sm text-black/55">Optional add-ons.</p>

            <div className="mt-6 rounded-[24px] border border-black/10 bg-white/60 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="grid gap-3">
                    {EXTRAS.map((x) => {
                        const qty = Number(extras?.[x.id]) || 0;

                        return (
                            <div
                                key={x.id}
                                className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white/70 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[14px] border border-black/10 bg-white">
                                        <ExtraIcon iconKey={x.icon} />
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-black">{x.name}</div>
                                        <div className="mt-1 text-xs text-black/55">
                                            € {x.price.toFixed(2)} <span className="text-black/40">•</span> {x.unit}
                                            <span className="text-black/40"> • </span>
                                            ~{x.hours >= 1 ? `${x.hours}h` : `${Math.round(x.hours * 60)}min`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateExtra(x.id, -1)}
                                        disabled={qty === 0}
                                        className={[
                                            "h-9 w-9 rounded-full border bg-white transition",
                                            qty === 0
                                                ? "border-black/10 text-black/25 cursor-not-allowed"
                                                : "border-black/15 hover:bg-black/5",
                                        ].join(" ")}
                                        aria-label="Decrease"
                                    >
                                        <Minus className="mx-auto h-4 w-4" />
                                    </button>

                                    <div className="w-7 text-center text-sm font-semibold text-black">{qty}</div>

                                    <button
                                        onClick={() => updateExtra(x.id, +1)}
                                        className="h-9 w-9 rounded-full border border-black/15 bg-white hover:bg-black/5 transition"
                                        aria-label="Increase"
                                    >
                                        <Plus className="mx-auto h-4 w-4 text-black/70" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ✅ Summary (как у тебя было раньше) */}
                {extrasTotal > 0 && (
                    <div className="mt-6 rounded-[18px] border border-black/10 bg-white/70 p-4">
                        <div className="text-xs font-semibold tracking-wide text-black/45">SELECTED EXTRAS</div>

                        <div className="mt-3 grid gap-2">
                            {selectedLines.map((l) => (
                                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-black/70">
                    {l.name} × {l.qty}
                  </span>
                                    <span className="font-semibold text-black">+ € {l.line.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                            <span className="text-sm font-semibold text-black">Extras Total</span>
                            <span className="text-sm font-semibold text-black">+ € {extrasTotal.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={prevStep}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black hover:bg-black/5"
                    >
                        Back
                    </button>
                    <button
                        onClick={nextStep}
                        className="w-full rounded-full border border-black/15 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </section>
    );
}