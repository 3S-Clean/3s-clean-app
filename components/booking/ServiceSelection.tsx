"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICES } from "@/lib/booking/config";
import { Check } from "lucide-react";
import { InfoHelp } from "@/components/ui/infohelp/InfoHelp";

/* ----------------------------- Tooltip ----------------------------- */
function Tooltip({
                     text,
                     title,
                     dark = false,
                 }: {
    text: string;
    title?: string;
    dark?: boolean;
}) {
    return <InfoHelp text={text} title={title} dark={dark} />;
}

export default function ServiceSelection() {
    const { selectedService, setSelectedService } = useBookingStore();

    // ✅ i18n namespaces (same as ExperiencePage)
    const t = useTranslations("booking.serviceSelection");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    // ✅ Build UI services from i18n + SERVICES (no texts in config)
    const servicesUi = useMemo(() => {
        return SERVICES.map((s) => {
            const name = tServices(`${s.id}.title`);
            const description = tServices(`${s.id}.desc`);

            const includes = s.includesKeys.map((key) => ({
                name: tIncludes(`${key}.name`),
                desc: tIncludes(`${key}.desc`),
            }));

            return { ...s, name, description, includes };
        });
    }, [tServices, tIncludes]);

    return (
        <div className="animate-fadeIn">
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">
                    {t("title")}
                </h1>
                <p className="text-[var(--muted)]">
                    {t("subtitle")}
                </p>
            </div>

            {/* SERVICES */}
            <div className="flex flex-col gap-5">
                {servicesUi.map((service) => {
                    const isSelected = selectedService === service.id;
                    const isDarkCard = !!service.isDark;

                    // ✅ base card (supports global dark mode too)
                    const baseCard = isDarkCard
                        ? "bg-gray-900 text-white"
                        : "bg-[var(--card)] text-[var(--text)] ring-1 ring-black/5 dark:ring-white/10";

                    // ✅ remove border/ring highlight completely
                    const interaction = isSelected
                        ? "shadow-xl -translate-y-[1px]"
                        : "hover:shadow-xl hover:-translate-y-1";

                    const descColor = isDarkCard ? "text-white/70" : "text-[var(--muted)]";
                    const divider = isDarkCard ? "border-white/15" : "border-black/10 dark:border-white/10";

                    return (
                        <button
                            key={service.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedService(isSelected ? null : service.id)}
                            className={[
                                "relative w-full text-left p-7 rounded-3xl transition-all duration-300",
                                // focus ring stays (accessibility)
                                "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
                                baseCard,
                                interaction,
                                "active:scale-[0.99]",
                            ].join(" ")}
                        >
                            {/* CHECKMARK (only selection indicator) */}
                            {isSelected && (
                                <div
                                    className={[
                                        "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center",
                                        isDarkCard ? "bg-white" : "bg-[var(--text)]",
                                    ].join(" ")}
                                    aria-hidden="true"
                                >
                                    <Check
                                        className={[
                                            "w-5 h-5",
                                            isDarkCard ? "text-gray-900" : "text-[var(--background)]",
                                        ].join(" ")}
                                    />
                                </div>
                            )}

                            {/* TITLE */}
                            <h3 className="text-2xl font-semibold mb-3">
                                {service.name}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className={["text-sm mb-5 leading-relaxed", descColor].join(" ")}>
                                {service.description}
                            </p>

                            {/* PRICE */}
                            <div className={["text-lg font-semibold pb-5 mb-5 border-b", divider].join(" ")}>
                                {t("from")} € {service.startingPrice}{" "}
                                <span className="text-sm font-normal opacity-70">
                  {t("incVat")}
                </span>
                            </div>

                            {/* BASE FEATURES TITLE (now from i18n, not config) */}
                            <p className={["text-sm font-medium mb-4", descColor].join(" ")}>
                                {t("includesTitle")}
                            </p>

                            {/* INCLUDES LIST */}
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
                                            {item.desc ? (
                                                <Tooltip text={item.desc} title={item.name} dark={isDarkCard} />
                                            ) : null}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}