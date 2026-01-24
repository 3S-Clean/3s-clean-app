"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* ---------- Arrow (soft spring via cubic-bezier, works on Android) ---------- */
function Arrow() {
    return (
        <svg
            className="
        w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] lg:w-[90px] lg:h-[90px]
        flex-shrink-0 text-[var(--muted)]
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:translate-x-2
        group-active:translate-x-1
        transition-colors duration-300
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

/* ---------- Section title (Promise / Stream / Experience) ---------- */
function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-sans font-bold tracking-[-0.02em] text-[var(--text)]
      text-2xl sm:text-3xl md:text-4xl mb-6">
            {children}
        </p>
    );
}

/* ---------- Big titles (SAUBER, BEHIND THE SCENES, etc.) ---------- */
function BigTitle({ children }: { children: React.ReactNode }) {
    return (
        <span className="
      text-[55px] sm:text-[60px] md:text-[65px] lg:text-[70px] xl:text-[75px]
      font-bold tracking-tight leading-[1.05] text-[var(--text)]
    ">
      {children}
    </span>
    );
}

/* ---------- Card base ---------- */
const cardBase = `
  rounded-2xl
  transition-all duration-300 ease-out
  xl:hover:bg-[var(--card)]
  xl:hover:shadow-[var(--shadow)]
  xl:hover:-translate-y-1
  active:bg-[var(--card)]
  active:shadow-[var(--shadow)]
  active:scale-[0.995]
  backdrop-blur-[6px]
`;

export default function HomePageClient() {
    const t = useTranslations("home");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const promise = [
        { id: "sauber", title: t("promise.sauber.title"), desc: t("promise.sauber.desc") },
        { id: "sicher", title: t("promise.sicher.title"), desc: t("promise.sicher.desc") },
        { id: "souveran", title: t("promise.souveran.title"), desc: t("promise.souveran.desc") },
    ];

    const experience = [
        { id: "maintenance", title: t("experience.maintenance.title"), desc: t("experience.maintenance.desc"), price: t("experience.maintenance.price") },
        { id: "reset", title: t("experience.reset.title"), desc: t("experience.reset.desc"), price: t("experience.reset.price") },
        { id: "initial", title: t("experience.initial.title"), desc: t("experience.initial.desc"), price: t("experience.initial.price") },
        { id: "handover", title: t("experience.handover.title"), desc: t("experience.handover.desc"), price: t("experience.handover.price") },
    ];

    return (
        <>
            <Header />

            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* ================= HERO ================= */}
                <section className="px-6 pt-6 pb-14 lg:pt-16 lg:pb-24 max-w-7xl mx-auto">
                    <div
                        className={`
              transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
            `}
                    >
                        <h1
                            className="
                font-sans font-bold tracking-[-0.03em]
                leading-[1.2] sm:leading-[1.15] lg:leading-[1.04]
                text-[80px] sm:text-[88px] md:text-[96px] lg:text-[104px] xl:text-[112px]
                text-[var(--text)]
                max-w-[18ch]
              "
                        >
                            {/* DESKTOP */}
                            <span className="hidden lg:block">
                Your premium home<br />
                cleaning service<br />
                in Stuttgart!
              </span>

                            {/* MOBILE / TABLET */}
                            <span className="block lg:hidden">
                {t("hero.title").replace(/\n/g, " ")}
              </span>
                        </h1>
                    </div>
                </section>

                {/* ================= PROMISE ================= */}
                <section className="px-6 pb-20 max-w-7xl mx-auto">
                    <div
                        className={`
              transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]
              delay-[300ms]
              ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
            `}
                    >
                        <SectionKicker>{t("promise.title")}</SectionKicker>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        {promise.map((it, index) => (
                            <Link
                                key={it.id}
                                href={`/definition/#${it.id}`}
                                className={`
                  group block xl:flex-1
                  transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                `}
                                style={{ transitionDelay: `${500 + index * 200}ms` }}
                            >
                                <div className={`${cardBase} px-6 py-6`}>
                                    <div className="flex items-center justify-between">
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

                {/* ================= VIDEO ================= */}
                <section className="w-full">
                    <div className="px-6 py-12 max-w-7xl mx-auto">
                        <SectionKicker>{t("video.kicker")}</SectionKicker>
                        <BigTitle>{t("video.title")}</BigTitle>
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

                {/* ================= EXPERIENCE ================= */}
                <section className="px-6 py-20 max-w-7xl mx-auto">
                    <SectionKicker>{t("experience.title")}</SectionKicker>
                    <h2 className="mb-14">
                        <BigTitle>Choose yours!</BigTitle>
                    </h2>

                    <div className="flex flex-col xl:grid xl:grid-cols-2 gap-6">
                        {experience.map((it) => (
                            <Link key={it.id} href={`/experience#${it.id}`} className="group block">
                                <div className={`${cardBase} px-6 py-6`}>
                                    <div className="flex items-center justify-between mb-3">
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