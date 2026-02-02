"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

import { SERVICES } from "@/lib/booking/config";
import type { ServiceId } from "@/lib/booking/config";

import ServiceCard from "@/components/booking/ServiceCard";
import { InfoHelp } from "@/components/ui/infohelp/InfoHelp";

/* ----------------------------- Tooltip ----------------------------- */
function Tooltip({ text, title }: { text: string; title?: string }) {
    return <InfoHelp text={text} title={title} />;
}

type OptionalServiceItem = {
    name: string;
    price: string;
    time?: string;
    frequency?: string;
};

type IncludeUI = { name: string; desc?: string };
type ServiceUI = (typeof SERVICES)[number] & {
    title: string;
    desc: string;
    includes: IncludeUI[];
};

export default function ExperiencePage() {
    const t = useTranslations("experiencePage");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    // optional services
    const optionalServices = useMemo(() => {
        const keys = [
            "linenSingle",
            "linenDouble",
            "oven",
            "fridge",
            "freezer",
            "windowsInside",
            "windowsOutside",
            "balcony",
            "limescale",
            "cupboards",
            "wardrobe",
            "upholstery",
            "handwash",
        ] as const;

        return keys
            .map((k) => t.raw(`optional.items.${k}`) as unknown)
            .filter((x): x is OptionalServiceItem => {
                if (!x || typeof x !== "object") return false;
                const obj = x as Record<string, unknown>;
                return typeof obj.name === "string" && typeof obj.price === "string";
            })
            .map((x) => x as OptionalServiceItem);
    }, [t]);

    const exclusions = useMemo(() => t.raw("exclusions.items") as string[], [t]);

    // services UI
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

    // headings by id (чтобы не было “includesHeading.reset” как текст)
    const includesHeadingById = useMemo(() => {
        return {
            core: t("cards.includesHeading.core"),
            initial: t("cards.includesHeading.initial"),
            reset: t("cards.includesHeading.reset"),
            handover: t("cards.includesHeading.handover"),
        } satisfies Record<ServiceId, string>;
    }, [t]);

    return (
        <>
            <Header />

            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* HERO */}
                <section className="px-6 pt-10 pb-8 md:pt-16 md:pb-12 max-w-7xl mx-auto">
                    <h1 className={`
                        inline-block whitespace-nowrap 
                        px-4 sm:px-5 md:px-7
                        font-sans font-bold text-left text-[var(--text)] mb-6
                        tracking-[0.05em]
                        text-[23px] leading-[2.2rem] 
                        sm:text-[26px] sm:leading-[2rem]
                        md:text-[29px] md:leading-[2rem]
                        xl:text-[32px] xl:leading-[3rem]
                        `}>
                        {t("hero.title")}
                    </h1>
                    <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">{t("hero.subtitle")}</p>
                </section>

                {/* CARDS (REUSED ServiceCard) */}
                <section className="px-6 py-10 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {servicesUi.map((service) => (
                            <ServiceCard
                                key={service.id}
                                mode="link"
                                href={`/booking?service=${encodeURIComponent(service.id)}`}
                                service={service}
                                title={service.title}
                                desc={service.desc}
                                includes={service.includes}
                                // labels
                                fromLabel={t("cards.from")}
                                incVatLabel={t("cards.incVat")}
                                includesHeading={includesHeadingById[service.id]}
                                // CTA
                                ctaLabel={t("cards.cta")} // "Select"
                                showCta={true}
                                // style
                                // tooltip component (если в ServiceCard поддержано)
                                Tooltip={Tooltip}
                            />
                        ))}
                    </div>
                </section>

                {/* OPTIONAL */}
                <section className="px-6 py-12 max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{t("optional.title")}</h2>
                    <p className="text-[var(--muted)] mb-8">{t("optional.subtitle")}</p>

                    <div className="space-y-4">
                        {optionalServices.map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-black/5 dark:border-white/10"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="font-medium">{item.name}</span>
                                    {item.frequency ? (
                                        <Tooltip
                                            title={item.name}
                                            text={`${item.time ? item.time + ", " : ""}${item.frequency}`}
                                        />
                                    ) : null}
                                </div>

                                <span className="text-[var(--muted)] font-medium">{item.price}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* EXCLUSIONS */}
                <section className="px-6 py-12 max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("exclusions.title")}</h2>

                    <ul className="space-y-3">
                        {exclusions.map((item, i) => (
                            <li key={i} className="flex items-start text-[var(--muted)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 mt-2 mr-3" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>

            <Footer />
        </>
    );
}