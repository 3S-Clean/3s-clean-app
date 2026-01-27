"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { useBookingStore } from "@/lib/booking/store";
import { SERVICES, type ServiceId } from "@/lib/booking/config";

import ServiceCard from "@/components/booking/ServiceCard";
import { InfoHelp } from "@/components/ui/infohelp/InfoHelp";

/* ----------------------------- Tooltip ----------------------------- */
function Tooltip({ text, title }: { text: string; title?: string }) {
    return <InfoHelp text={text} title={title} />;
}

type IncludeUI = { name: string; desc?: string };
type ServiceUI = (typeof SERVICES)[number] & {
    title: string;
    desc: string;
    includes: IncludeUI[];
};

export default function ServiceSelection() {
    const { selectedService, setSelectedService } = useBookingStore();

    const t = useTranslations("booking.serviceSelection");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    // services UI (config + i18n)
    const servicesUi = useMemo((): ServiceUI[] => {
        return SERVICES.map((s) => {
            const title = tServices(`${s.id}.title`);
            const desc = tServices(`${s.id}.desc`);

            const includes = s.includesKeys.map((key) => {
                const name = tIncludes(`${key}.name`);
                const rawDesc = tIncludes(`${key}.desc`);
                const desc = rawDesc?.trim() ? rawDesc : undefined;
                return { name, desc };
            });

            return { ...s, title, desc, includes };
        });
    }, [tServices, tIncludes]);

    // per-card includes heading (like Experience)
    const includesHeadingById = useMemo(() => {
        return {
            core: t("includesHeading.core"),
            initial: t("includesHeading.initial"),
            reset: t("includesHeading.reset"),
            handover: t("includesHeading.handover"),
        } satisfies Record<ServiceId, string>;
    }, [t]);

    const onSelect = useCallback(
        (id: ServiceId) => setSelectedService(selectedService === id ? null : id),
        [selectedService, setSelectedService]
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent, id: ServiceId) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(id);
            }
        },
        [onSelect]
    );

    return (
        <div className="animate-fadeIn">
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* CARDS (reused ServiceCard) */}
            <div className="flex flex-col gap-5">
                {servicesUi.map((service) => {
                    const isSelected = selectedService === service.id;

                    return (
                        <div
                            key={service.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => onSelect(service.id)}
                            onKeyDown={(e) => onKeyDown(e, service.id)}
                            className={[
                                "relative rounded-3xl transition-all duration-300 cursor-pointer select-none",
                                "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
                                isSelected ? "shadow-xl -translate-y-[1px]" : "hover:shadow-xl hover:-translate-y-1",
                                "active:scale-[0.99]",
                            ].join(" ")}
                        >
                            {/* CHECKMARK (same UX as before) */}
                            {isSelected && (
                                <div
                                    className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900"
                                    aria-hidden="true"
                                >
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <ServiceCard
                                mode="select"
                                selected={isSelected}
                                onSelect={() => onSelect(service.id)}
                                service={service}
                                title={service.title}
                                desc={service.desc}
                                includes={service.includes}
                                fromLabel={t("from")}
                                incVatLabel={t("incVat")}
                                includesHeading={includesHeadingById[service.id]}
                                showCta={false} // ✅ booking step: card click selects
                                ctaLabel="" // ignored when showCta=false
                                Tooltip={Tooltip}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}