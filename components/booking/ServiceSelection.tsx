"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

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

    // per-card includes heading
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

    return (
        <div className="animate-fadeIn">
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">
                    {t("title")}
                </h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* CARDS */}
            <div className="flex flex-col gap-5">
                {servicesUi.map((service) => {
                    const isSelected = selectedService === service.id;

                    return (
                        <ServiceCard
                            key={service.id}
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
                            showCta={false}
                            ctaLabel=""
                            Tooltip={Tooltip}
                        />
                    );
                })}
            </div>
        </div>
    );
}