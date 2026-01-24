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
                <span key={i} className="block">
                    {line}
                </span>
            ))}
        </>
    );
}

function Arrow() {
    return (
        <span
            className="text-3xl md:text-4xl leading-none text-[var(--muted)]
                 transition-all duration-300 ease-out
                 group-hover:text-[var(--text)] group-hover:translate-x-2"
            aria-hidden="true"
        >
            ›
        </span>
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
                {/* HERO + 3S PROMISE */}
                <section className="px-6 pt-10 pb-14 md:pt-16 md:pb-20 max-w-7xl mx-auto">
                    {/* HERO TITLE - Linear-style entrance animation */}
                    <div
                        className={`
                            mb-12 md:mb-16
                            transition-all duration-700 ease-out
                            ${isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                        }
                        `}
                    >
                        <h1
                            className="m-0 p-0 font-sans font-bold tracking-[-0.03em] leading-[1.02] text-left
                                text-[var(--text)]
                                text-[48px] sm:text-[56px] md:text-[72px] lg:text-[88px] xl:text-[100px]"
                        >
                            <TextLines text={t("hero.title")} />
                        </h1>
                    </div>

                    {/* 3S PROMISE SECTION */}
                    <div>
                        <h2
                            className={`
                                text-base sm:text-lg md:text-xl font-semibold mb-8 md:mb-10
                                text-[var(--text)]
                                transition-all duration-700 ease-out delay-100
                                ${isLoaded
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                            }
                            `}
                        >
                            {t("promise.title")}
                        </h2>

                        {/* Cards: vertical on mobile, horizontal on tablet+ */}
                        <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8">
                            {promise.map((it, index) => (
                                <Link
                                    key={it.id}
                                    href={`/definition/#${it.id}`}
                                    className={`
                                        group block flex-1
                                        transition-all duration-700 ease-out
                                        ${isLoaded
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                    }
                                    `}
                                    style={{
                                        transitionDelay: isLoaded ? `${200 + index * 100}ms` : "0ms",
                                    }}
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
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-none text-[var(--text)]">
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
                    </div>
                </section>

                {/* VIDEO - Full viewport on all devices */}
                <section className="relative w-full h-screen overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 px-6 py-8 z-10">
                        <p className="text-sm text-white/70 mb-2">{t("video.kicker")}</p>
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                            {t("video.title")}
                        </h2>
                    </div>

                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/videos/live-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/20" />
                </section>

                {/* EXPERIENCE */}
                <section className="px-6 py-14 md:py-20 max-w-6xl mx-auto">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-10 md:mb-12 text-[var(--text)]">
                        {t("experience.title")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {experience.map((it) => (
                            <Link
                                key={it.id}
                                href={`/experience#${it.id}`}
                                className="
                                    group block p-5 md:p-6
                                    rounded-2xl
                                    transition-all duration-300 ease-out
                                    hover:bg-[var(--card)]
                                    hover:shadow-[var(--shadow)]
                                    hover:-translate-y-1
                                "
                            >
                                <p className="text-sm text-[var(--muted)] mb-2">{it.kicker}</p>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-[var(--text)]">{it.title}</h3>
                                <p className="text-[var(--muted)] text-sm md:text-base mb-4">{it.desc}</p>

                                <p className="text-base md:text-lg font-semibold flex items-center gap-2 text-[var(--text)]">
                                    {it.price}
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">›</span>
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
