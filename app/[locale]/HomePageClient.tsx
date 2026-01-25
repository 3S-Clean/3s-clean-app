"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* -----------------------------
   Arrow
------------------------------ */
function Arrow() {
    return (
        <svg
            className="
        ml-auto
        w-[64px] h-[64px]
        sm:w-[72px] sm:h-[72px]
        lg:w-[80px] lg:h-[80px]
        flex-shrink-0
        text-[var(--muted)]
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:translate-x-1
        group-active:translate-x-[2px]
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
   Section kicker
------------------------------ */
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-sans font-bold tracking-[-0.02em] text-[var(--text)] text-2xl sm:text-3xl md:text-4xl mb-6">
            {children}
        </p>
    );
}

/* -----------------------------
   Big titles (cards)
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
        text-[54px] sm:text-[60px] md:text-[65px] lg:text-[65px] xl:text-[68px]
        font-bold tracking-tight leading-[1.05] text-[var(--text)]
        ${className}
      `}
        >
      {children}
    </span>
    );
}

/* -----------------------------
   Card base (same hover/touch feel everywhere)
------------------------------ */
const cardBase =
    "rounded-2xl transition-all duration-220 ease-out " +
    "hover:bg-[var(--card)] hover:shadow-[var(--shadow)] hover:-translate-y-1 " +
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

    // EN: ["Your","premium","home","cleaning","service","in Stuttgart!"]
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
                id: "core",
                title: t("experience.maintenance.title"),
                desc: t("experience.maintenance.desc"),
                price: t("experience.maintenance.price"),
            },
            {
                id: "initial",
                title: t("experience.initial.title"),
                desc: t("experience.initial.desc"),
                price: t("experience.initial.price"),
            },
            {
                id: "reset",
                title: t("experience.reset.title"),
                desc: t("experience.reset.desc"),
                price: t("experience.reset.price"),
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
            full screen on mobile/tablet so Promise never shows
           ========================= */}
                <section className="px-6 pt-16 max-w-7xl mx-auto flex flex-col justify-start min-h-[calc(100dvh-80px)] overflow-hidden xl:min-h-0 xl:overflow-visible xl:pb-10">
                    {/* Mobile/Tablet hero (original breaks) */}
                    <div className="xl:hidden">
                        {heroRaw.split("\n").map((line, i) => (
                            <div
                                key={`m-${i}`}
                                className="opacity-0 translate-y-6 animate-[heroIn_900ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
                                style={{ animationDelay: `${i * 180}ms` }}
                            >
                                <h1 className="m-0 p-0 font-sans font-bold tracking-[-0.03em] text-left text-[var(--text)] max-w-[14ch] text-[86px] sm:text-[94px] md:text-[102px] lg:text-[104px] leading-[1.02] sm:leading-[1.01] md:leading-[1.01]">
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* Desktop hero (3 lines) */}
                    <div className="hidden xl:block">
                        {desktopHeroLines.map((line, i) => (
                            <div
                                key={`d-${i}`}
                                className="opacity-0 translate-y-8 animate-[heroIn_1000ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
                                style={{ animationDelay: `${i * 200}ms` }}
                            >
                                <h1 className="m-0 p-0 font-sans font-bold tracking-[-0.03em] leading-[1.05] text-left text-[var(--text)] max-w-[18ch] text-[96px] 2xl:text-[110px]">
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* spacer to keep Promise hidden on mobile/tablet */}
                    <div className="flex-1 xl:hidden" />
                    <div className="h-17 xl:hidden" />
                </section>

                {/* =========================
            PROMISE
            cards animation ONLY on desktop (xl)
           ========================= */}
                <section className="px-6 pt-12 sm:pt-16 pb-14 lg:pb-20 max-w-7xl xl:max-w-[1400px] mx-auto xl:pt-20">
                    <SectionKicker>{t("promise.title")}</SectionKicker>

                    <div className="flex flex-col xl:flex-row xl:gap-8">
                        {promise.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/definition#${it.id}`}
                                className="
                  group block min-w-0
                  opacity-100 translate-y-0
                  xl:flex-1 xl:opacity-0 xl:translate-y-6
                  xl:animate-[promiseIn_900ms_cubic-bezier(0.16,1,0.3,1)_forwards]
                  motion-reduce:xl:opacity-100 motion-reduce:xl:translate-y-0 motion-reduce:xl:animate-none
                "
                                style={{ animationDelay: `${650 + index * 160}ms` }}
                            >
                                {/* Важно: на phone/tablet ограничиваем ширину, но ВСЕГДА слева (mr-auto) */}
                                <div
                                    className={`
                    ${cardBase}
                    w-full min-w-0
                    max-w-[520px] sm:max-w-[560px] md:max-w-[720px]
                    mr-auto
                    xl:max-w-none
                   py-8 sm:py-9 md:py-10 xl:py-6т x-0
                  `}
                                >
                                    <div className="flex items-center justify-between gap-4 min-w-0">
                                        {/* на десктопе держим заголовок в одну строку */}
                                        <BigTitle className="leading-none min-w-0 break-words xl:whitespace-nowrap">
                                            {it.title}
                                        </BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="text-[var(--muted)] text-base md:text-lg mb-5 leading-relaxed max-w-[38ch]">
                                        {it.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* =========================
            VIDEO (no animations)
           ========================= */}
                <section className="w-full">
                    <div className="px-6 pt-10 pb-6 lg:pt-14 lg:pb-8 max-w-7xl xl:max-w-[1400px] mx-auto">
                        <SectionKicker>{t("video.kicker")}</SectionKicker>
                        <h2 className="mt-2">
                            <BigTitle>{t("video.title")}</BigTitle>
                        </h2>
                        <p className="mt-5 text-[var(--muted)] text-base md:text-lg leading-relaxed">
                            {t("video.desc")}
                        </p>
                    </div>

                    <div className="relative w-full h-[100svh] overflow-hidden">
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover object-center">
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* =========================
            EXPERIENCE (no animations)
           ========================= */}
                <section className="px-6 py-14 lg:py-20 max-w-7xl xl:max-w-[1400px] mx-auto">
                    <SectionKicker>{t("experience.kicker")}</SectionKicker>

                    <h2 className="mb-10 lg:mb-14">
                        <BigTitle>{t("experience.title")}</BigTitle>
                    </h2>

                    <div className="flex flex-col xl:grid xl:grid-cols-2 gap-3 xl:gap-8">
                        {experience.map((it) => (
                            <Link key={it.id} href={`/experience#${it.id}`} className="group block min-w-0">
                                {/* Те же правила: ограничение ширины на phone/tablet, но слева */}
                                <div
                                    className={`
                    ${cardBase}
                    w-full min-w-0
                    max-w-[520px] sm:max-w-[560px] md:max-w-[720px]
                    mr-auto
                    xl:max-w-none
                   py-8 sm:py-9 md:py-10 xl:py-6т x-0
                  `}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-4 min-w-0">
                                        <BigTitle className="leading-none min-w-0 break-words xl:whitespace-nowrap">
                                            {it.title}
                                        </BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="text-[var(--muted)] text-base md:text-lg mb-5 leading-relaxed max-w-[38ch]">
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

                {/* keyframes (global) */}
                <style jsx global>{`
          @keyframes heroIn {
            from {
              opacity: 0;
              transform: translate3d(0, 24px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          @keyframes promiseIn {
            from {
              opacity: 0;
              transform: translate3d(0, 24px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
        `}</style>
            </main>

            <Footer />
        </>
    );
}