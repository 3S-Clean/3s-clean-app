"use client";

import Link from "next/link";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { SERVICES } from "@/lib/booking/config";
import { InfoHelp } from "@/components/ui/infohelp/InfoHelp";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

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

type OptionalServiceItem = {
    name: string;
    price: string;
    time?: string;
    frequency?: string;
};

type IncludeUI = { name: string; desc?: string };
type ServiceUI = (typeof SERVICES)[number] & { title: string; desc: string; includes: IncludeUI[] };

/* --------------------------- Service Card --------------------------- */
function ServiceCard({
                         service,
                         title,
                         desc,
                         includes,
                         ctaLabel,
                         fromLabel,
                         incVatLabel,
                         includesFallback,
                     }: {
    service: (typeof SERVICES)[number];
    title: string;
    desc: string;
    includes: IncludeUI[];
    ctaLabel: string;
    fromLabel: string;
    incVatLabel: string;
    includesFallback: string;
}) {
    // ✅ no ring/border highlights
    const base = service.isDark
        ? "bg-gray-900 text-white"
        : "bg-[var(--card)] text-[var(--text)]";

    const muted = service.isDark ? "text-white/70" : "text-[var(--muted)]";

    return (
        <div id={service.id} className={`rounded-3xl ${base}`}>
            <div className="px-6 md:px-8 py-8 md:py-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>

                <p className={`text-sm mb-6 ${muted}`}>{desc}</p>

                <p className="text-2xl font-bold mb-6">
                    {fromLabel} € {service.startingPrice}{" "}
                    <span className="text-sm font-normal opacity-70">{incVatLabel}</span>
                </p>

                <Link
                    href="/booking"
                    className={`block w-full py-4 rounded-full text-center font-medium mb-8 transition ${
                        service.isDark
                            ? "bg-white text-gray-900 hover:bg-gray-100"
                            : "bg-[var(--text)] text-[var(--background)] hover:opacity-90"
                    }`}
                >
                    {ctaLabel}
                </Link>

                <p className={`text-sm font-medium mb-4 ${muted}`}>{includesFallback}</p>

                <ul className="space-y-3">
                    {includes.map((it, i) => (
                        <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-3 opacity-60" />
                            <span className="flex items-center flex-wrap">
                {it.name}
                                {it.desc ? <Tooltip text={it.desc} title={it.name} dark={service.isDark} /> : null}
              </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/* ------------------------------ Page ------------------------------ */
export default function ExperiencePage() {
    const t = useTranslations("experiencePage");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    // optional services: keys -> raw object
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

    // services: config + i18n
    const servicesUi = useMemo((): ServiceUI[] => {
        return SERVICES.map((s) => {
            const title = tServices(`${s.id}.title`);
            const desc = tServices(`${s.id}.desc`);

            const includes = s.includesKeys.map((key) => {
                const name = tIncludes(`${key}.name`);
                // desc может быть пустой строкой — это ок
                const rawDesc = tIncludes(`${key}.desc`);
                const desc = rawDesc?.trim() ? rawDesc : undefined;
                return { name, desc };
            });

            return { ...s, title, desc, includes };
        });
    }, [tServices, tIncludes]);

    return (
        <>
            <Header />

            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* HERO */}
                <section className="px-6 pt-10 pb-8 md:pt-16 md:pb-12 max-w-7xl mx-auto">
                    {/* ✅ переносы как на главной */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight whitespace-pre-line">
                        {t("hero.title")}
                    </h1>

                    <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">{t("hero.subtitle")}</p>
                </section>

                {/* CARDS */}
                <section className="px-6 py-10 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {servicesUi.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                title={service.title}
                                desc={service.desc}
                                includes={service.includes}
                                ctaLabel={t("cards.cta")}
                                fromLabel={t("cards.from")}
                                incVatLabel={t("cards.incVat")}
                                includesFallback={t("cards.includesFallback")}
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