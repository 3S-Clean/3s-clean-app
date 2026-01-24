"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* -----------------------------
   Arrow (soft spring feel)
------------------------------ */
function Arrow() {
    return (
        <svg
            className="
        w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px]
        flex-shrink-0 text-[var(--muted)]
        transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:translate-x-2
        group-active:translate-x-1
        group-hover:text-[var(--text)]
        group-active:text-[var(--text)]
      "
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

/* -----------------------------
   Section title (bigger)
------------------------------ */
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="
        font-sans font-bold tracking-[-0.02em] text-[var(--text)]
        text-2xl sm:text-3xl md:text-4xl
        mb-6
      "
        >
            {children}
        </p>
    );
}

/* -----------------------------
   Big titles (SAUBER etc.)
------------------------------ */
function BigTitle({
                      children,
                      className = "",
                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`
        text-[55px] sm:text-[60px] md:text-[65px] lg:text-[70px] xl:text-[75px]
        font-bold tracking-tight leading-[1.05] text-[var(--text)]
        ${className}
      `}
        >
      {children}
    </span>
    );
}

/* -----------------------------
   Card interaction (hover + touch)
------------------------------ */
const cardBase =
    "rounded-2xl transition-all duration-220 ease-out " +
    "xl:hover:bg-[var(--card)] xl:hover:shadow-[var(--shadow)] xl:hover:-translate-y-1 " +
    "active:bg-[var(--card)]/80 active:backdrop-blur-lg active:shadow-[var(--shadow)] active:-translate-y-[2px] active:scale-[0.995] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)]/20 " +
    "motion-reduce:transition-none motion-reduce:hover:transform-none";

/* -----------------------------
   HERO line splitting (desktop only)
------------------------------ */
function formatDesktopHero(raw: string) {
    const parts = (raw || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    // EN expected: ["Your","premium","home","cleaning","service","in Stuttgart!"]
    if (parts.length >= 6) {
        const line1 = `${parts[0]} ${parts[1]}`.trim();
        const line2 = `${parts[2]} ${parts[3]} ${parts[4]}`.trim();
        const line3 = parts.slice(5).join(" ").trim();
        return [line1, line2, line3].filter(Boolean);
    }

    if (parts.length >= 3) {
        const mid = Math.ceil(parts.length / 3);
        return [
            parts.slice(0, mid).join(" "),
            parts.slice(mid, mid * 2).join(" "),
            parts.slice(mid * 2).join(" "),
        ].filter(Boolean);
    }

    return [raw.replace(/\n/g, " ").trim()];
}

export default function HomePageClient() {
    const t = useTranslations("home");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 260);
        return () => clearTimeout(timer);
    }, []);

    const heroRaw = t("hero.title");
    const desktopHeroLines = useMemo(() => formatDesktopHero(heroRaw), [heroRaw]);

    const promise = useMemo(
        () => [
            { id: "sauber", title: t("promise.sauber.title"), desc: t("promise.sauber.desc") },
            { id: "sicher", title: t("promise.sicher.title"), desc: t("promise.sicher.desc") },
            { id: "souveran", title: t("promise.souveran.title"), desc: t("promise.souveran.desc") },
        ],
        [t]
    );

    const experience = useMemo(
        () => [
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
        ],
        [t]
    );

    return (
        <>
            <Header />

            <main className="min-h-screen bg-[var(--background)] pt-[80px] overflow-x-hidden">
                {/* =========================
            HERO
            ✅ FIX: iOS Safari — делаем 100dvh и добавляем spacer,
            чтобы PROMISE никогда не выглядывал снизу.
           ========================= */}
                <section
                    className="
            px-6 pt-6
            max-w-7xl mx-auto
            flex flex-col justify-start

            /* mobile/tablet: строго на весь экран */
            min-h-[calc(100dvh-80px)]
            overflow-hidden

            /* desktop: как было */
            xl:min-h-0 xl:overflow-visible xl:pb-10
          "
                >
                    {/* Mobile/Tablet hero (keep original line breaks) */}
                    <div className="xl:hidden">
                        {heroRaw.split("\n").map((line, i) => (
                            <div
                                key={`m-${i}`}
                                className={`
                  transition-all duration-[1700ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}
                `}
                                style={{ transitionDelay: `${i * 340}ms` }}
                            >
                                <h1
                                    className="
                    m-0 p-0
                    font-sans font-bold tracking-[-0.03em]
                    text-left text-[var(--text)]
                    max-w-[14ch]
                    text-[86px] sm:text-[94px] md:text-[102px] lg:text-[104px]
                    leading-[0.985]
                  "
                                >
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* Desktop hero (3 lines, controlled) */}
                    <div className="hidden xl:block">
                        {desktopHeroLines.map((line, i) => (
                            <div
                                key={`d-${i}`}
                                className={`
                  transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
                `}
                                style={{ transitionDelay: `${i * 360}ms` }}
                            >
                                <h1
                                    className="
                    m-0 p-0
                    font-sans font-bold tracking-[-0.03em]
                    leading-[1.05]
                    text-left text-[var(--text)]
                    max-w-[18ch]
                    text-[96px] 2xl:text-[110px]
                  "
                                >
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* ✅ spacer: на мобиле “добивает” до низа экрана */}
                    <div className="flex-1 xl:hidden" />

                    {/* маленький запас снизу (на всякий) */}
                    <div className="h-6 xl:hidden" />
                </section>

                {/* =========================
            PROMISE
           ========================= */}
                <section className="px-6 pb-14 lg:pb-20 max-w-7xl mx-auto xl:pt-12">
                    <div
                        className={`
              transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
            `}
                        style={{ transitionDelay: "1500ms" }}
                    >
                        <SectionKicker>{t("promise.title")}</SectionKicker>
                    </div>

                    <div className="flex flex-col xl:flex-row xl:gap-8">
                        {promise.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/definition/#${it.id}`}
                                className={`
                  group block xl:flex-1 min-w-0
                  transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"}
                `}
                                style={{ transitionDelay: `${1750 + index * 260}ms` }}
                            >
                                <div
                                    className={`
                    ${cardBase}

                    py-8 sm:py-9 md:py-10
                    px-5 sm:px-6 md:px-8

                    xl:py-6 xl:px-6

                    w-full
                    md:max-w-[720px] md:mx-auto
                    xl:max-w-none xl:mx-0
                    min-w-0
                  `}
                                >
                                    <div className="flex items-center justify-between gap-4 min-w-0">
                                        <BigTitle className="leading-none min-w-0 break-words">{it.title}</BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="mt-5 text-[var(--muted)] text-base md:text-lg leading-relaxed max-w-prose">
                                        {it.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* =========================
            VIDEO
           ========================= */}
                <section className="w-full">
                    <div className="px-6 py-10 lg:py-14 max-w-7xl mx-auto">
                        <SectionKicker>{t("video.kicker")}</SectionKicker>
                        <h2 className="mt-2">
                            <BigTitle>{t("video.title")}</BigTitle>
                        </h2>
                    </div>

                    <div className="relative w-full h-[100svh] overflow-hidden">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        >
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* =========================
            EXPERIENCE
           ========================= */}
                <section className="px-6 py-14 lg:py-20 max-w-7xl mx-auto">
                    <SectionKicker>{t("experience.kicker")}</SectionKicker>

                    <h2 className="mb-10 lg:mb-14">
                        <BigTitle>{t("experience.title")}</BigTitle>
                    </h2>

                    <div className="flex flex-col xl:grid xl:grid-cols-2 gap-3 xl:gap-8">
                        {experience.map((it) => (
                            <Link key={it.id} href={`/experience#${it.id}`} className="group block min-w-0">
                                <div
                                    className={`
                    ${cardBase}

                    py-8 sm:py-9 md:py-10
                    px-5 sm:px-6 md:px-8

                    xl:py-6 xl:px-6

                    w-full
                    md:max-w-[760px] md:mx-auto
                    xl:max-w-none xl:mx-0
                    min-w-0
                  `}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-4 min-w-0">
                                        <BigTitle className="leading-none min-w-0 break-words">{it.title}</BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="text-[var(--muted)] text-base md:text-lg mb-5 max-w-prose">
                                        {it.desc}
                                    </p>

                                    <p className="text-lg md:text-xl font-semibold text-[var(--text)]">{it.price}</p>
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