"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICES, type ServiceId } from "@/lib/booking/config";
import { Check } from "lucide-react";
import { InfoHelp } from "@/components/ui/infohelp/InfoHelp";

function Tooltip({ text, title, dark = false }: { text: string; title?: string; dark?: boolean }) {
    return <InfoHelp text={text} title={title} dark={dark} />;
}

type IncludeUI = { name: string; desc?: string };
type ServiceUI = (typeof SERVICES)[number] & { name: string; description: string; includes: IncludeUI[] };

export default function ServiceSelection() {
    const { selectedService, setSelectedService } = useBookingStore();

    const t = useTranslations("booking.serviceSelection");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    const servicesUi: ServiceUI[] = useMemo(() => {
        return SERVICES.map((s) => {
            const name = tServices(`${s.id}.title`);
            const description = tServices(`${s.id}.desc`);

            const includes = s.includesKeys.map((key) => {
                const incName = tIncludes(`${key}.name`);
                const incDesc = tIncludes(`${key}.desc`);
                return { name: incName, desc: incDesc?.trim() ? incDesc : undefined };
            });

            return { ...s, name, description, includes };
        });
    }, [tServices, tIncludes]);

    const toggle = useCallback(
        (id: ServiceId) => setSelectedService(selectedService === id ? null : id),
        [selectedService, setSelectedService]
    );

    const onKey = useCallback(
        (e: React.KeyboardEvent, id: ServiceId) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(id);
            }
        },
        [toggle]
    );

    return (
        <div className="animate-fadeIn">
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* SERVICES */}
            <div className="flex flex-col gap-5">
                {servicesUi.map((service) => {
                    const isSelected = selectedService === service.id;
                    const isDarkCard = !!service.isDark;

                    const baseCard = isDarkCard
                        ? "bg-gray-900 text-white"
                        : "bg-[var(--card)] text-[var(--text)] ring-1 ring-black/5 dark:ring-white/10";

                    // ✅ no “ring border highlight” — only soft lift/shadow
                    const interaction = isSelected ? "shadow-xl -translate-y-[1px]" : "hover:shadow-xl hover:-translate-y-1";

                    const muted = isDarkCard ? "text-white/70" : "text-[var(--muted)]";
                    const divider = isDarkCard ? "border-white/15" : "border-black/10 dark:border-white/10";

                    return (
                        <div
                            key={service.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => toggle(service.id)}
                            onKeyDown={(e) => onKey(e, service.id)}
                            className={[
                                "relative w-full text-left p-7 rounded-3xl transition-all duration-300 cursor-pointer select-none",
                                "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
                                baseCard,
                                interaction,
                                "active:scale-[0.99]",
                            ].join(" ")}
                        >
                            {/* CHECKMARK */}
                            {isSelected && (
                                <div
                                    className={[
                                        "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center",
                                        isDarkCard ? "bg-white" : "bg-[var(--text)]",
                                    ].join(" ")}
                                    aria-hidden="true"
                                >
                                    <Check className={["w-5 h-5", isDarkCard ? "text-gray-900" : "text-[var(--background)]"].join(" ")} />
                                </div>
                            )}

                            <h3 className="text-2xl font-semibold mb-3">{service.name}</h3>

                            <p className={["text-sm mb-5 leading-relaxed", muted].join(" ")}>{service.description}</p>

                            <div className={["text-lg font-semibold pb-5 mb-5 border-b", divider].join(" ")}>
                                {t("from")} € {service.startingPrice}{" "}
                                <span className="text-sm font-normal opacity-70">{t("incVat")}</span>
                            </div>

                            <p className={["text-sm font-medium mb-4", muted].join(" ")}>{t("includesTitle")}</p>

                            <div className="flex flex-col gap-2">
                                {service.includes.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                    <span
                        className={[
                            "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                            isDarkCard ? "bg-white/60" : "bg-[var(--text)]/60",
                        ].join(" ")}
                        aria-hidden="true"
                    />
                                        <span className="flex items-center flex-wrap">
                      {item.name}
                                            {item.desc ? <Tooltip text={item.desc} title={item.name} dark={isDarkCard} /> : null}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}