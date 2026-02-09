"use client";

import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {useMemo} from "react";
import Header from "@/shared/layout/header/Header";
import Footer from "@/shared/layout/footer/Footer";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/shared/ui/layout";
import {CARD_FRAME_GHOST_ACTION} from "@/shared/ui/card/CardFrame";

/* -----------------------------
   Arrow
------------------------------ */
function Arrow({className = ""}: { className?: string }) {
    return (
        <svg
            className={`
        w-[18px] h-[37px]
        sm:w-[20px] sm:h-[40px]
        lg:w-[24px] lg:h-[48px]
        flex-shrink-0
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:translate-x-1
        group-active:translate-x-[2px]
        ${className}
      `}
            viewBox="0 0 19.64 37.59"
            fill="none"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeWidth="1.19"
            xmlns="http://www.w3.org/2000/svg"
        >
            <polyline points=".42 .42 18.79 18.79 .42 37.17"/>
        </svg>
    );
}

function BigTitle({
                      children,
                      className = "",
                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3
            className={[
                "min-w-0",
                "font-sans font-semibold tracking-[0em] text-[var(--text)]",
                "text-[43px] leading-[4rem]",
                "sm:text-[48px] sm:leading-[4rem]",
                "md:text-[50px] md:leading-[3rem]",
                "xl:text-[52px] xl:leading-[3rem]",
                className,
            ].join(" ")}
        >
            {children}
        </h3>
    );
}

function SectionKicker({
                           children,
                           className = "",
                       }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={[
                "inline-block whitespace-nowrap",
                "font-sans font-bold text-left text-[var(--text)] mb-6",
                "tracking-[0.05em]",
                "text-[23px] leading-[2.2rem]",
                "sm:text-[26px] sm:leading-[2rem]",
                "md:text-[29px] md:leading-[2rem]",
                "xl:text-[32px] xl:leading-[3rem]",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}

function BodyText({
                      children,
                      className = "",
                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={[
                "min-w-0 text-left text-[var(--text)]",
                "text-[15px] leading-[1.2rem] md:text-lg",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}

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
    const locale = useLocale();

    const withLocale = (href: string) => {
        const path = href.startsWith("/") ? href : `/${href}`;
        return `/${locale}${path}`;
    };
    const t = useTranslations("home");
    const heroRaw = t("hero.title");
    const desktopHeroLines = useMemo(() => formatDesktopHero(heroRaw), [heroRaw]);
    const promise = useMemo(
        () => [
            {id: "sauber", title: t("promise.sauber.title"), desc: t("promise.sauber.desc")},
            {id: "sicher", title: t("promise.sicher.title"), desc: t("promise.sicher.desc")},
            {id: "souveran", title: t("promise.souveran.title"), desc: t("promise.souveran.desc")},
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
            <Header/>
            <main className="min-h-screen bg-[var(--background)] pt-[90px] sm:pt-[86px] overflow-x-hidden">
                {/* =========================
            HERO
           ========================= */}
                <section
                    className={`
                        px-3 sm:px-4 md:px-6
                        flex flex-col justify-start
                        mx-auto w-full max-w-7xl xl:max-w-[1400px]
                        pt-8 pb-24
                        lg:pt-4 lg:pb-0
                       `}
                >
                    <div className="px-4 sm:px-5 md:px-7">
                        {/* Mobile (< md): много строк, слева */}
                        <div className={`md:hidden pb-32`}>
                            {heroRaw.split("\n").map((line, i) => (
                                <div
                                    key={`m-${i}`}
                                    className={`
                                      opacity-0 translate-y-6
                                      animate-[heroIn_1100ms_cubic-bezier(0.16,1,0.3,1)_forwards]
                                    `}
                                    style={{animationDelay: `${i * 180}ms`}}
                                >
                                    <h1
                                        className={`
                                        m-0 p-0 font-sans font-semibold
                                        text-left text-[var(--text)]
                                        tracking-[-0.01em]
                                        text-[clamp(55px,16vw,85px)]
                                        leading-[1.02]
                                        sm:leading-[1.04]
                                        md:leading-[1.06] 
                                      `}
                                    >
                                        {line}
                                    </h1>
                                </div>
                            ))}
                        </div>
                        {/* md+ (≥ 768px): 3 строки, тоже слева */}
                        <div className={`hidden md:block pb-10`}>
                            {desktopHeroLines.map((line, i) => (
                                <div
                                    key={`d-${i}`}
                                    className={`
                                      opacity-0 translate-y-8
                                      animate-[heroIn_1000ms_cubic-bezier(0.16,1,0.3,1)_forwards]
                                    `}
                                    style={{animationDelay: `${i * 200}ms`}}
                                >
                                    <h1
                                        className={`
                                m-0 p-0 font-sans font-semibold
                                text-left text-[var(--text)]
                                tracking-[-0.01em]
                                text-[clamp(60px,6vw,90px)]
                                leading-[1.04]
                              `}
                                    >
                                        {line}
                                    </h1>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* =========================
            PROMISE
           ========================= */}
                <section className="mt-16 xl:pt-20">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionKicker>{t("promise.title")}</SectionKicker>
                        </div>
                        <div className="flex flex-col gap-6 xl:flex-row xl:gap-12">
                            {promise.map((it, index) => (
                                <Link
                                    key={it.id}
                                    href={withLocale(`/promise#${it.id}`)}
                                    scroll={false}
                                    className="
                                            group block w-full min-w-0
                                            opacity-100 translate-y-0
                                            xl:flex-1 md:opacity-0 md:translate-y-6
                                            md:animate-[promiseIn_900ms_cubic-bezier(0.16,1,0.3,1)_forwards]
                                            motion-reduce:md:opacity-100 motion-reduce:md:translate-y-0 motion-reduce:md:animate-none
                                        "
                                    style={{animationDelay: `${650 + index * 160}ms`}}
                                >
                                    <div className={[
                                        CARD_FRAME_GHOST_ACTION,
                                        "w-full min-w-0",
                                        "max-w-[440px] md:max-w-[460px] xl:max-w-[520px]",
                                        "mr-auto",
                                        "py-9 sm:py-9 md:py-10 xl:py-6",
                                        "px-4 sm:px-5 md:px-6",
                                    ].join(" ")}
                                    >
                                        {/* Title + Arrow рядом */}
                                        <div className="flex items-center gap-[17px] min-w-0 mb-5">
                                            <BigTitle className="min-w-0 whitespace-nowrap">
                                                {it.title}
                                            </BigTitle>
                                            <Arrow className="shrink-0"/>
                                        </div>
                                        <BodyText className="w-full mb-5 max-w-[340px]">
                                            {it.desc}
                                        </BodyText>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                {/* =========================
            VIDEO
           ========================= */}
                <section className="w-full mt-16">
                    <div className={PAGE_CONTAINER + " xl:pt-20"}>
                        <div className={CONTENT_GUTTER}>
                            <SectionKicker>{t("video.kicker")}</SectionKicker>
                            <span className="mt-2">
                                <BigTitle>{t("video.title")}</BigTitle>
                            </span>
                        </div>
                    </div>
                    <div className="relative w-full h-[100svh] overflow-hidden">
                        <video autoPlay muted loop playsInline
                               className="absolute inset-0 w-full h-full object-cover object-center">
                            <source src="/videos/live-video.mp4" type="video/mp4"/>
                        </video>
                    </div>
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <BodyText className="mb-5">
                                {t("video.desc")}
                            </BodyText>
                        </div>
                    </div>
                </section>
                {/* =========================
            EXPERIENCE
           ========================= */}
                <section className="mb-14 mt-16 xl:pt-20">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionKicker>{t("experience.kicker")}</SectionKicker>
                        </div>
                        <div className="flex flex-col xl:grid xl:grid-cols-2 gap-y-6 xl:gap-y-8 gap-x-3 xl:gap-x-4">
                            {experience.map((it) => (
                                <Link key={it.id}
                                      href={withLocale(`/experience#${it.id}`)}
                                      scroll={false}
                                      className="group block min-w-0">
                                    <div className={[
                                        CARD_FRAME_GHOST_ACTION,
                                        "w-full min-w-0",
                                        "max-w-[440px] md:max-w-[460px] xl:max-w-[520px]",
                                        "mr-auto",
                                        "py-9 sm:py-9 md:py-10 xl:py-6",
                                        "px-4 sm:px-5 md:px-6",
                                    ].join(" ")}
                                    >
                                        <div className="grid grid-cols-[1fr_max-content] gap-x-6 gap-y-4 min-w-0">
                                            <BigTitle className="min-w-0">
                                                {it.title}
                                            </BigTitle>
                                            <div/>
                                            <BodyText className="max-w-[340px]">
                                                {it.desc}
                                            </BodyText>
                                            {/* Price + Arrow — строго по контенту */}
                                            <div
                                                className="inline-flex items-center gap-[10px] self-center w-max whitespace-nowrap">
                                                <p className="text-lg md:text-xl font-semibold text-[var(--text)]">
                                                    {it.price}
                                                </p>
                                                <Arrow/>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
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

            <Footer/>
        </>
    );
}