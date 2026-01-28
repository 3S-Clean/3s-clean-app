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
      w-[18px] h-[37px]
      sm:w-[20px] sm:h-[40px]
      lg:w-[24px] lg:h-[48px]
      flex-shrink-0
      text-[var(--muted)]
      transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
      group-hover:translate-x-1
      group-active:translate-x-[2px]
    "
            viewBox="0 0 19.64 37.59"
            fill="none"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeWidth="1.19"
            xmlns="http://www.w3.org/2000/svg"
        >
            <polyline points=".42 .42 18.79 18.79 .42 37.17" />
        </svg>
    );
}

/* -----------------------------
   Section kicker
------------------------------ */
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p
            className={`
                inline-block whitespace-nowrap
                font-sans font-bold text-left text-[var(--text)] mb-6
                tracking-[0.05em]
                text-[23px] leading-[2.3rem] 
                sm:text-[35px] sm:leading-[2rem]
                md:text-[26px] md:leading-[2rem]
                xl:text-[33.5] xl:leading-[3rem]
        
      `}
        >
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
            inline-block whitespace-nowrap
            min-w-0
            font-sans font-semibold tracking-[0em] text-[var(--text)]
            text-[43px] leading-[36px]
            sm:text-[45px] sm:leading-[4rem]
            md:text-[35px] md:leading-[3rem]
            xl:text-[53] xl:leading-[3.9575rem]
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

/* -----------------------------
   Experience mapping (NO maintenance)
------------------------------ */
const EXPERIENCE_ORDER = ["core", "initial", "reset", "handover"] as const;
type ExperienceId = (typeof EXPERIENCE_ORDER)[number];

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

    // ✅ only: core/initial/reset/handover (and i18n uses the same keys)
    const experience = useMemo(() => {
        return EXPERIENCE_ORDER.map((id: ExperienceId) => ({
            id,
            title: t(`experience.${id}.title`),
            desc: t(`experience.${id}.desc`),
            price: t(`experience.${id}.price`),
        }));
    }, [t]);

    return (
        <>
            <Header />

            <main className="min-h-screen bg-[var(--background)] pt-[80px] overflow-x-hidden">
                {/* =========================
            HERO
           ========================= */}
                <section
                    className={`
    px-4 w-full h-dvh md:h-auto
    flex flex-col justify-center md:justify-start
    md:pt-16 md:pb-10
    lg:pb-20 lg:max-w-7xl lg:mx-auto lg:pt-20
    xl:max-w-[1400px]
  `}
                >
                    {/* 320–899px */}
                    <div className={`desktop:hidden`}>
                        {heroRaw.split("\n").map((line, i) => (
                            <div
                                key={`m-${i}`}
                                className={`
          opacity-0 translate-y-6
          animate-[heroIn_900ms_cubic-bezier(0.16,1,0.3,1)_forwards]
        `}
                                style={{ animationDelay: `${i * 180}ms` }}
                            >
                                <h1
                                    className={`
            m-0 p-0 font-sans font-semibold
            text-left text-[var(--text)]
            tracking-[-0.01em]
            text-[49px] leading-[52px]
            sm:text-[55px] sm:leading-[58px]
            md:text-[60px] md:leading-[62px]
          `}
                                >
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>

                    {/* 900px+ (3 строки, тоже слева) */}
                    <div className={`hidden desktop:block`}>
                        {desktopHeroLines.map((line, i) => (
                            <div
                                key={`d-${i}`}
                                className={`
          opacity-0 translate-y-8
          animate-[heroIn_1000ms_cubic-bezier(0.16,1,0.3,1)_forwards]
        `}
                                style={{ animationDelay: `${i * 200}ms` }}
                            >
                                <h1
                                    className={`
            m-0 p-0 font-sans font-semibold
            text-left text-[var(--text)]
            tracking-[-0.01em]
            text-[56px] leading-[60px]
            lg:text-[65px] lg:leading-[69px]
          `}
                                >
                                    {line}
                                </h1>
                            </div>
                        ))}
                    </div>
                </section>
                {/* =========================
            PROMISE
           ========================= */}
                <section className="px-4 pt-[88px] sm:pt-16 pb-16 lg:pb-20 max-w-7xl xl:max-w-[1400px] mx-auto xl:pt-20">
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
                                <div
                                    className={`
                                            ${cardBase}
                                            w-full min-w-0
                                            max-w-[520px] sm:max-w-[560px] md:max-w-[720px]
                                            mr-auto
                                            xl:max-w-none
                                            py-9 sm:py-9 md:py-10 xl:py-6 px-0
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-6 min-w-0">
                                        <BigTitle className="flex-1 min-w-0 whitespace-nowrap mb-5">
                                            {it.title}
                                        </BigTitle>
                                        <Arrow/>
                                    </div>
                                    <p className="text-[var(--text)] text-[13.12px] md:text-lg mb-5 max-w-[269px]">
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
            EXPERIENCE
           ========================= */}
                <section className="px-6 py-14 lg:py-20 max-w-7xl xl:max-w-[1400px] mx-auto">
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
                    w-full min-w-0
                    max-w-[520px] sm:max-w-[560px] md:max-w-[720px]
                    mr-auto
                    xl:max-w-none
                    py-8 sm:py-9 md:py-10 xl:py-6 px-0
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