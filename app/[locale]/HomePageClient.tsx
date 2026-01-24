"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* ================= Arrow (soft spring, no warnings) ================= */
function Arrow() {
    return (
        <svg
            className="
        w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px]
        flex-shrink-0 text-[var(--muted)]
        transition-[transform,color] duration-500
        ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:translate-x-2
        group-active:translate-x-1
        group-hover:text-[var(--text)]
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

/* ================= Section title ================= */
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="
        font-sans font-bold tracking-[-0.02em]
        text-[var(--text)]
        text-2xl sm:text-3xl md:text-4xl
        mb-6
      "
        >
            {children}
        </p>
    );
}

/* ================= Big titles ================= */
function BigTitle({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="
        text-[55px] sm:text-[60px] md:text-[65px]
        lg:text-[70px] xl:text-[75px]
        font-bold tracking-tight leading-[1.05]
        text-[var(--text)]
      "
        >
      {children}
    </span>
    );
}

/* ================= Card base (padding + blur + micro scale) ================= */
const cardBase = `
  rounded-2xl
  px-4 sm:px-5
  transition-all duration-250
  ease-[cubic-bezier(0.16,1,0.3,1)]

  xl:hover:bg-[var(--card)]
  xl:hover:shadow-[var(--shadow)]
  xl:hover:-translate-y-1

  active:bg-[var(--card)]
  active:shadow-[var(--shadow)]
  active:translate-y-[1px]
  active:scale-[0.995]
  active:blur-[0.6px]

  motion-reduce:transition-none
`;

export default function HomePageClient() {
    const t = useTranslations("home");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 120);
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

            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* ================= HERO ================= */}
                <section
                    className="
            px-6
            min-h-[calc(100svh-80px)]
            flex flex-col justify-start
            pt-10
            lg:min-h-0 lg:pt-16 lg:pb-20
            max-w-7xl mx-auto
          "
                >
                    <div
                        className={`
              transition-all duration-[1600ms]
              ease-[cubic-bezier(0.12,0.8,0.2,1)]
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"}
            `}
                    >
                        <h1
                            className="
                m-0 p-0
                font-sans font-bold tracking-[-0.03em]
                leading-none text-left text-[var(--text)]
                max-w-[14ch]
                text-[80px]
                sm:text-[88px]
                md:text-[96px]
                lg:text-[104px]
                xl:text-[112px]
              "
                        >
                            {t("hero.title").replace(/\n/g, " ")}
                        </h1>
                    </div>
                </section>

                {/* ================= PROMISE ================= */}
                <section className="px-6 pb-14 lg:pb-20 max-w-7xl mx-auto">
                    <div
                        className={`
              transition-all duration-[1200ms]
              ease-[cubic-bezier(0.12,0.8,0.2,1)]
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
            `}
                    >
                        <SectionKicker>{t("promise.title")}</SectionKicker>
                    </div>

                    <div className="flex flex-col xl:flex-row xl:gap-8">
                        {promise.map((it) => (
                            <Link key={it.id} href={`/definition/#${it.id}`} className="group block xl:flex-1">
                                <div className={`${cardBase} py-6 xl:py-5`}>
                                    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                        <BigTitle>{it.title}</BigTitle>
                                        <Arrow />
                                    </div>

                                    <p className="mt-4 text-[var(--muted)] text-base md:text-lg max-w-prose">
                                        {it.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ================= VIDEO ================= */}
                <section className="w-full">
                    <div className="px-6 py-10 lg:py-14 max-w-7xl mx-auto">
                        <SectionKicker>{t("video.kicker")}</SectionKicker>
                        <h2 className="mt-2">
                            <BigTitle>{t("video.title")}</BigTitle>
                        </h2>
                    </div>

                    <div className="relative w-full h-[100svh] overflow-hidden">
                        {/* optional subtle overlay for readability (remove if you don't want it) */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />

                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="
                absolute inset-0 w-full h-full
                object-cover
                object-center
                sm:scale-[0.98] scale-[0.96]
                lg:scale-100
                will-change-transform
              "
                        >
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* ================= EXPERIENCE ================= */}
                <section className="px-6 py-14 lg:py-20 max-w-7xl mx-auto">
                    <h2 className="mb-10 lg:mb-14">
                        <BigTitle>Choose yours!</BigTitle>
                    </h2>

                    <div className="flex flex-col xl:grid xl:grid-cols-2 gap-2 xl:gap-8">
                        {experience.map((it) => (
                            <Link key={it.id} href={`/experience#${it.id}`} className="group block">
                                <div className={`${cardBase} py-6 xl:py-5`}>
                                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-3">
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