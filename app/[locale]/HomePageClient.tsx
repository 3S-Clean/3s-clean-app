"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

function TextLines({ text }: { text: string }) {
    return (
        <>
            {text.split("\n").map((line, i) => (
                <span key={i} className="block md:inline">
                    {line}
                    {/* Add space between words on desktop */}
                    <span className="hidden md:inline"> </span>
                </span>
            ))}
        </>
    );
}

function Arrow() {
    return (
        <svg
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[var(--muted)]
                transition-all duration-300 ease-out
                group-hover:text-[var(--text)] group-hover:translate-x-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9 6l6 6-6 6" />
        </svg>
    );
}

export default function HomePageClient() {
    const t = useTranslations("home");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
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
            kicker: t("experience.maintenance.kicker"),
            title: t("experience.maintenance.title"),
            desc: t("experience.maintenance.desc"),
            price: t("experience.maintenance.price"),
        },
        {
            id: "reset",
            kicker: t("experience.reset.kicker"),
            title: t("experience.reset.title"),
            desc: t("experience.reset.desc"),
            price: t("experience.reset.price"),
        },
        {
            id: "initial",
            kicker: t("experience.initial.kicker"),
            title: t("experience.initial.title"),
            desc: t("experience.initial.desc"),
            price: t("experience.initial.price"),
        },
        {
            id: "handover",
            kicker: t("experience.handover.kicker"),
            title: t("experience.handover.title"),
            desc: t("experience.handover.desc"),
            price: t("experience.handover.price"),
        },
    ];

    return (
        <>
            <Header />

            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* HERO - Full viewport on mobile */}
                <section className="px-6 min-h-[calc(100vh-80px)] md:min-h-0 md:h-auto flex flex-col justify-center md:block md:pt-16 md:pb-20 max-w-7xl mx-auto">
                    {/* HERO TITLE - Linear-style entrance animation */}
                    <div
                        className={`
                            mb-0 md:mb-16
                            transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                            ${isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-12"
                        }
                        `}
                    >
                        <h1
                            className="m-0 p-0 font-sans font-bold tracking-[-0.03em] leading-[1.02] text-left
                                text-[var(--text)] max-w-[14ch]
                                text-[70px] sm:text-[75px] md:text-[80px] lg:text-[92px] xl:text-[105px]"
                        >
                            <TextLines text={t("hero.title")} />
                        </h1>
                    </div>
                </section>

                {/* 3S PROMISE SECTION - Separate on mobile */}
                <section className="px-6 pb-14 md:pb-20 max-w-7xl mx-auto">
                    <h2
                        className={`
                                text-base sm:text-lg md:text-xl font-semibold mb-8 md:mb-10
                                text-[var(--text)]
                                transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                                ${isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-12"
                        }
                            `}
                        style={{
                            transitionDelay: isLoaded ? "150ms" : "0ms",
                        }}
                    >
                        {t("promise.title")}
                    </h2>

                    {/* Cards: vertical on mobile/tablet, horizontal on desktop (lg+) */}
                    <div className="flex flex-col lg:flex-row lg:gap-8">
                        {promise.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/definition/#${it.id}`}
                                className={`
                                        group block lg:flex-1
                                        transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                                        ${isLoaded
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-12"
                                }
                                    `}
                                style={{
                                    transitionDelay: isLoaded ? `${300 + index * 150}ms` : "0ms",
                                }}
                            >
                                <div
                                    className="
                                            py-4 px-0
                                            lg:py-5 lg:px-5
                                            lg:rounded-2xl
                                            h-full
                                            transition-all duration-300 ease-out
                                            lg:hover:bg-[var(--card)]
                                            lg:hover:shadow-[var(--shadow)]
                                            lg:hover:-translate-y-1
                                            motion-reduce:transition-none motion-reduce:hover:transform-none
                                        "
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="text-[50px] sm:text-[55px] lg:text-5xl xl:text-6xl font-bold tracking-tight leading-none text-[var(--text)]">
                                            {it.title}
                                        </h3>
                                        <Arrow />
                                    </div>

                                    <p className="mt-3 text-[var(--muted)] text-sm md:text-base leading-relaxed">
                                        {it.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* VIDEO - Text above, video below */}
                <section className="w-full">
                    {/* Text section above video */}
                    <div className="px-6 py-8 md:py-12 max-w-7xl mx-auto">
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text)] mb-4">
                            {t("video.kicker")}
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text)]">
                            {t("video.title")}
                        </h2>
                    </div>

                    {/* Video - full viewport */}
                    <div className="relative w-full h-screen overflow-hidden">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* EXPERIENCE */}
                <section className="px-6 py-14 md:py-20 max-w-7xl mx-auto">
                    <p className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-[var(--text)]">
                        {t("experience.title")}
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-10 md:mb-12 text-[var(--text)]">
                        Choose yours!
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                        {experience.map((it) => (
                            <Link
                                key={it.id}
                                href={`/experience#${it.id}`}
                                className="group block"
                            >
                                <div
                                    className="
                                        py-4 px-0
                                        md:py-5 md:px-5
                                        md:rounded-2xl
                                        h-full
                                        transition-all duration-300 ease-out
                                        md:hover:bg-[var(--card)]
                                        md:hover:shadow-[var(--shadow)]
                                        md:hover:-translate-y-1
                                        motion-reduce:transition-none motion-reduce:hover:transform-none
                                    "
                                >
                                    <p className="text-sm text-[var(--muted)] mb-2">{it.kicker}</p>

                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-none text-[var(--text)]">
                                            {it.title}
                                        </h3>
                                        <Arrow />
                                    </div>

                                    <p className="text-[var(--muted)] text-sm md:text-base mb-4">{it.desc}</p>

                                    <p className="text-base md:text-lg font-semibold text-[var(--text)]">
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