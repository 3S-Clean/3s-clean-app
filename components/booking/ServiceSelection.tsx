"use client";

import {useCallback, useMemo} from "react";
import {useTranslations} from "next-intl";

import {useBookingStore} from "@/lib/booking/store";
import {type ServiceId, SERVICES} from "@/lib/booking/config";

import ServiceCard from "@/components/booking/ServiceCard";
import {InfoHelp} from "@/components/ui/info-help/InfoHelp";

/* ----------------------------- Tooltip ----------------------------- */
function Tooltip({text, title}: { text: string; title?: string }) {
    return <InfoHelp text={text} title={title}/>;
}

type IncludeUI = { name: string; desc?: string };
type ServiceUI = (typeof SERVICES)[number] & {
    title: string;
    desc: string;
    rule: string;
    includes: IncludeUI[];
};

type IncludeRaw = {
    name: string;
    desc?: string;
};

export default function ServiceSelection() {
    const {selectedService, setSelectedService} = useBookingStore();

    const t = useTranslations("booking.serviceSelection");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    // services UI (config + i18n)
    const servicesUi = useMemo((): ServiceUI[] => {
        return SERVICES.map((s) => {
            const title = tServices(`${s.id}.title`);
            const desc = tServices(`${s.id}.desc`);
            const rule = tServices(`${s.id}.rule`);

            const includes = s.includesKeys.map((key) => {
                const raw = tIncludes.raw(key) as
                    | (Partial<Record<ServiceId, IncludeRaw>> & { core?: IncludeRaw })
                    | undefined;

                const picked = raw?.[s.id] ?? raw?.core;

                const name = picked?.name ?? "";
                const rawDesc = picked?.desc ?? "";
                const desc = rawDesc.trim() ? rawDesc : undefined;

                return {name, desc};
            });

            return {...s, title, desc, rule, includes};
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
            <div className="flex flex-col gap-9">
                {servicesUi.map((service) => {
                    const isSelected = selectedService === service.id;
                    return (
                        <div key={service.id}>
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
                                showCta={false}
                                ctaLabel=""
                                Tooltip={Tooltip}
                            />
                            <p className="pl-7 mt-4 text-sm text-[var(--muted)]">
                                <span className="font-semibold text-[var(--text)]">Rule of thumb:</span>{" "}
                                {service.rule}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}