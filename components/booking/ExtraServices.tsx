"use client";

import { EXTRAS } from "@/lib/booking/config";
import { useBookingStore } from "@/lib/booking/store";
import {
    Minus,
    Plus,
    Bed,
    Flame,
    Snowflake,
    AppWindow,
    Trees,
    Droplets,
    Archive,
    Shirt,
    Armchair,
    Package,
} from "lucide-react";

function ExtraIcon({ id }: { id: string }) {
    // безопасная мапа, без риска "иконки нет в lucide"
    const map: Record<string, any> = {
        "linen-single": Bed,
        "linen-double": Bed,
        oven: Flame,
        fridge: Package,
        freezer: Snowflake,
        "windows-inside": AppWindow,
        "windows-outside": AppWindow,
        balcony: Trees,
        limescale: Droplets,
        cupboards: Archive,
        wardrobe: Shirt,
        sofa: Armchair,
    };

    const Icon = map[id] ?? Package;
    return <Icon className="h-5 w-5 text-black/70" />;
}

export default function ExtraServices() {
    const { extras, updateExtra, nextStep, prevStep } = useBookingStore();

    return (
        <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Extras</h2>
            <p className="mt-2 text-sm text-black/55">Optional add-ons.</p>

            <div className="mt-6 rounded-[24px] border border-black/10 bg-white/60 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="grid gap-3">
                    {EXTRAS.map((x) => {
                        const qty = extras?.[x.id] ?? 0;
                        return (
                            <div
                                key={x.id}
                                className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white/70 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[14px] border border-black/10 bg-white">
                                        <ExtraIcon id={x.id} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-black">{x.name}</div>
                                        <div className="mt-1 text-xs text-black/55">
                                            € {x.price.toFixed(2)} • {x.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateExtra(x.id, -1)}
                                        className="h-9 w-9 rounded-full border border-black/15 bg-white hover:bg-black/5"
                                        aria-label="Decrease"
                                    >
                                        <Minus className="mx-auto h-4 w-4 text-black/70" />
                                    </button>
                                    <div className="w-7 text-center text-sm font-semibold text-black">{qty}</div>
                                    <button
                                        onClick={() => updateExtra(x.id, +1)}
                                        className="h-9 w-9 rounded-full border border-black/15 bg-white hover:bg-black/5"
                                        aria-label="Increase"
                                    >
                                        <Plus className="mx-auto h-4 w-4 text-black/70" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

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