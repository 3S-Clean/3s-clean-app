"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

// Стрелка — большая, как на макете (минимум 70px)
function Arrow() {
    return (
        <svg
            className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px] flex-shrink-0 text-[var(--muted)]
        transition-all duration-300 ease-out
        group-hover:text-[var(--text)] group-hover:translate-x-2
        group-active:text-[var(--text)] group-active:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9 5l7 7-7 7" />
        </svg>
    );
}

// Заголовок секции — крупнее (как на последнем фото)
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="font-sans font-bold tracking-[-0.02em] text-[var(--text)]
      text-2xl sm:text-3xl md:text-4xl mb-6"
        >
            {children}
        </p>
    );
}

// Большой заголовок (SAUBER, BEHIND THE SCENES, Choose yours!, Maintenance)
function BigTitle({
                      children,
                      className = "",
                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`text-[55px] sm:text-[60px] md:text-[65px] lg:text-[70px] xl:text-[75px]
        font-bold tracking-tight leading-[1.05] text-[var(--text)] ${className}`}
        >
      {children}
    </span>
    );
}

// Общий “минимальный card эффект” (и hover и touch)
const cardBase =
    "rounded-2xl transition-all duration-200 ease-out " +
    "xl:hover:bg-[var(--card)] xl:hover:shadow-[var(--shadow)] xl:hover:-translate-y-1 " +
    "active:bg-[var(--card)] active:shadow-[var(--shadow)] active:-translate-y-[2px] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)]/20 " +
    "motion-reduce:transition-none motion-reduce:hover:transform-none";

export default function HomePageClient() {
    const t = useTranslations("home");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const promise = [
        { id: "sauber", title: t("promise.sauber.title"), desc: t("promise.sauber.desc") },
        { id: "sicher", title: t("promise.sicher.title"), desc: t("promise.sicher.desc") },
        { id: "souveran", title: t("promise.souveran.title"), desc: t("promise.souveran.desc") },
    ];

    const experience = [
        {
            id: "maintenance",
            title: t("experience.maintenance.title"),
            desc: t("experience.maintenance.desc"),
            price: t("experience.maintenance.price"),
        },
        {
            id: "reset",
            title: t("experience.reset.title"),
            desc: t("experience.reset.desc"),
            price: t("experience.reset.price"),
        },
        {
            id: "initial",
            title: t("experience.initial.title"),
            desc: t("experience.initial.desc"),
            price: t("experience.initial.price"),
        },
        {
            id: "handover",
            title: t("experience.handover.title"),
            desc: t("experience.handover.desc"),
            price: t("experience.handover.price"),
        },
    ];

    return (
        <>
            <Header />

            {/* pt[80] оставляем, т.к. у тебя header перекрывает контент */}
            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* HERO — заголовок у самого начала (mobile/tablet) */}
                <section className="px-6 pt-6 pb-10 lg:pt-16 lg:pb-20 max-w-7xl mx-auto">
                    <div
                        className={`
              transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}
            `}
                    >
                        <h1
                            className="
    m-0 p-0
    font-sans font-bold tracking-[-0.03em]
    leading-none
    text-left text-[var(--text)]
    max-w-[14ch]
    text-[80px] sm:text-[88px] md:text-[96px] lg:text-[112px] xl:text-[120px]
  "
                        >
                            {/* Mobile / Tablet: как сейчас (из JSON) */}
                            <span className="whitespace-pre-line lg:hidden">
    {t("hero.title")}
  </span>

                            {/* Desktop: строго 3 строки */}
                            <span className="hidden lg:block whitespace-pre-line">
    {"Your premium\nhome cleaning service\nin Stuttgart!"}
  </span>
                        </h1>
                    </div>
                </section>

                {/* 3S PROMISE SECTION */}
                <section className="px-6 pb-14 lg:pb-20 max-w-7xl mx-auto">
                    <div
                        className={`
              transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            `}
                        style={{ transitionDelay: "120ms" }}
                    >
                        <SectionKicker>{t("promise.title")}</SectionKicker>
                    </div>

                    {/* На планшете как на телефоне: ряд только на desktop (xl) */}
                    <div className="flex flex-col xl:flex-row xl:gap-8">
                        {promise.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/definition/#${it.id}`}
                                className={`
                  group block xl:flex-1
                  transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}
                `}
                                style={{ transitionDelay: `${240 + index * 140}ms` }}
                            >
                                <div className={`${cardBase} py-6 px-0 xl:py-5 xl:px-5`}>
                                    {/* ✅ стрелка + заголовок в одну линию */}
                                    <div className="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_80px] lg:grid-cols-[1fr_90px] gap-4 items-center">
                                        <BigTitle>{it.title}</BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="mt-4 text-[var(--muted)] text-base md:text-lg leading-relaxed max-w-prose">
                                        {it.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* VIDEO - Text above, video below */}
                <section className="w-full">
                    <div className="px-6 py-10 lg:py-14 max-w-7xl mx-auto">
                        <SectionKicker>{t("video.kicker")}</SectionKicker>
                        <h2 className="mt-2">
                            <BigTitle>{t("video.title")}</BigTitle>
                        </h2>
                    </div>

                    <div className="relative w-full h-[100svh] overflow-hidden">
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* EXPERIENCE */}
                <section className="px-6 py-14 lg:py-20 max-w-7xl mx-auto">
                    {/* ✅ 3S-Clean Experience берём из experience.kicker */}
                    <SectionKicker>{t("experience.kicker")}</SectionKicker>

                    {/* ✅ Choose yours берём из experience.title */}
                    <h2 className="mb-10 lg:mb-14">
                        <BigTitle>{t("experience.title")}</BigTitle>
                    </h2>

                    {/* На планшете как на телефоне: сетка 2 колонки только на desktop (xl) */}
                    <div className="flex flex-col xl:grid xl:grid-cols-2 gap-2 xl:gap-8">
                        {experience.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/experience#${it.id}`}
                                className={`
                  group block
                  transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                                style={{ transitionDelay: `${160 + index * 120}ms` }}
                            >
                                <div className={`${cardBase} py-6 px-0 xl:py-5 xl:px-5`}>
                                    {/* ✅ стрелка + заголовок в одну линию */}
                                    <div className="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_80px] lg:grid-cols-[1fr_90px] gap-4 items-center mb-3">
                                        <BigTitle>{it.title}</BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="text-[var(--muted)] text-base md:text-lg mb-4 max-w-prose">
                                        {it.desc}
                                    </p>

                                    <p className="text-lg md:text-xl font-semibold text-[var(--text)]">
                                        {it.price}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}