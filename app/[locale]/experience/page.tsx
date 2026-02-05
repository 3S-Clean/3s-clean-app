"use client";

import {useMemo} from "react";
import {useTranslations} from "next-intl";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import type {ServiceId} from "@/lib/booking/config";
import {SERVICES} from "@/lib/booking/config";
import ServiceCard from "@/components/booking/ServiceCard";
import {InfoHelp} from "@/components/ui/infohelp/InfoHelp";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";
import PageTitle from "@/components/ui/typography/PageTitle";
import PageSubtitle from "@/components/ui/typography/PageSubtitle";
import SectionTitle from "@/components/ui/typography/SectionTitle";
import BodyText from "@/components/ui/typography/BodyText";

/* ----------------------------- Tooltip ----------------------------- */
function Tooltip({text, title}: { text: string; title?: string }) {
    return <InfoHelp text={text} title={title}/>;
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
    rule: string;
    includes: IncludeUI[];
};

type IncludeRaw = {
    name: string;
    desc?: string;
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
            const rule = tServices(`${s.id}.rule`);

            const includes = s.includesKeys.map((key) => {
                const raw = tIncludes.raw(key) as
                    | (Partial<Record<ServiceId, IncludeRaw>> & { core?: IncludeRaw })
                    | undefined;

                const picked = raw?.[s.id] ?? raw?.core;

                const name = picked?.name ?? "";
                const rawDesc = picked?.desc ?? "";
                const desc = typeof rawDesc === "string" && rawDesc.trim() ? rawDesc : undefined;

                return {name, desc};
            });

            return {...s, title, desc, rule, includes};
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
            <Header/>
            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* HERO */}
                <section className="pt-10 pb-8 md:pt-16 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <PageTitle className="mb-6">{t("hero.title")}</PageTitle>
                            <PageSubtitle>{t("hero.subtitle")}</PageSubtitle>
                        </div>
                    </div>
                </section>

                {/* CARDS (REUSED ServiceCard) */}
                <section className="py-10">
                    <div className={PAGE_CONTAINER}>
                        <div className="grid md:grid-cols-2 gap-9">
                            {servicesUi.map((service) => (
                                <div key={service.id}>
                                    <ServiceCard
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
                                        // tooltip component (если в ServiceCard поддержано)
                                        Tooltip={Tooltip}
                                    />
                                    <p className="pl-7 mt-4 text-sm text-[var(--muted)]">
                                        <span className="font-semibold text-[var(--text)]">Rule of thumb:</span>{" "}
                                        {service.rule}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* OPTIONAL */}
                <section className="py-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionTitle className="pb-3">{t("optional.title")}</SectionTitle>
                            <BodyText>{t("optional.subtitle")}</BodyText>
                            <div className="space-y-4 pt-5">
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
                        </div>
                    </div>
                </section>
                {/* EXCLUSIONS */}
                <section className="py-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionTitle className="pb-3">{t("exclusions.title")}</SectionTitle>
                            <ul className="space-y-3">
                                {exclusions.map((item, i) => (
                                    <li key={i} className="flex items-start text-[var(--muted)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 mt-2 mr-3"/>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}