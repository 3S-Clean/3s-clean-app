"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICES, type ServiceId, calculateHours } from "@/lib/booking/config";
import { Check } from "lucide-react";

export default function ServiceSelection() {
    const { selectedService, setSelectedService, apartmentSize, extras, nextStep } = useBookingStore();

    function pick(id: ServiceId) {
        setSelectedService(id);
        nextStep();
    }

    return (
        <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Choose service</h2>
            <p className="mt-2 text-sm text-black/55">Pick the cleaning package.</p>

            <div className="mt-6 grid gap-4">
                {SERVICES.map((s) => {
                    const isSelected = selectedService === s.id;

                    // ✅ hours считаем для КАЖДОЙ карточки (а не через selectedService)
                    const hoursForCard = apartmentSize ? calculateHours(s.id, apartmentSize, extras) : null;

                    // базовая тема карточки
                    const baseCard = s.isDark ? "bg-black text-white border-white/12" : "bg-white/70 text-black border-black/10";

                    // выделение по твоим правилам:
                    // светлая — тёмный бордер + тёмная галочка
                    // тёмная — белый бордер + белая галочка
                    const selectedBorder = s.isDark ? "border-white" : "border-[#1A1A1A]";
                    const checkWrapSelected = s.isDark
                        ? "border-white text-white"
                        : "border-[#1A1A1A] text-[#1A1A1A]";

                    const checkWrapUnselected = s.isDark
                        ? "border-white/18 text-white/40"
                        : "border-black/12 text-black/30";

                    return (
                        <button
                            key={s.id}
                            onClick={() => pick(s.id)}
                            className={[
                                "relative w-full text-left rounded-[26px] border p-5 transition",
                                "shadow-[0_16px_50px_rgba(0,0,0,0.06)]",
                                baseCard,
                                isSelected ? selectedBorder : "",
                                s.isDark ? "hover:bg-black/90" : "hover:bg-white",
                            ].join(" ")}
                        >
                            {/* галочка */}
                            <span
                                className={[
                                    "absolute right-4 top-4 h-8 w-8 rounded-full border flex items-center justify-center",
                                    isSelected ? checkWrapSelected : checkWrapUnselected,
                                ].join(" ")}
                            >
                <Check className="h-4 w-4" />
              </span>

                            <div className="pr-12">
                                <div className="text-base font-semibold">{s.name}</div>
                                <div className={s.isDark ? "mt-1 text-sm text-white/60" : "mt-1 text-sm text-black/55"}>
                                    {s.description}
                                </div>

                                <div className={s.isDark ? "mt-4 text-xs text-white/60" : "mt-4 text-xs text-black/55"}>
                                    Includes:
                                </div>
                                <ul className={s.isDark ? "mt-2 text-xs text-white/70 space-y-1" : "mt-2 text-xs text-black/60 space-y-1"}>
                                    {s.includes.slice(0, 7).map((it) => (
                                        <li key={it} className="flex gap-2">
                                            <span className={s.isDark ? "text-white/40" : "text-black/35"}>•</span>
                                            <span>{it}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Цена/время снизу — как ты просил */}
                            <div
                                className={
                                    s.isDark
                                        ? "mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4"
                                        : "mt-5 rounded-[18px] border border-black/10 bg-white/60 p-4"
                                }
                            >
                                <div className={s.isDark ? "text-xl font-semibold tracking-tight text-white" : "text-xl font-semibold tracking-tight text-black"}>
                                    € {s.startingPrice.toFixed(2)}
                                </div>
                                <div className={s.isDark ? "mt-1 text-sm text-white/60" : "mt-1 text-sm text-black/55"}>
                                    inc. VAT{" "}
                                    {hoursForCard != null ? (
                                        <span className={s.isDark ? "text-white/50" : "text-black/45"}>• ~{hoursForCard}h</span>
                                    ) : null}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}