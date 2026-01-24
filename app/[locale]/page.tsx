"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
            className="text-3xl md:text-4xl leading-none text-black/40
                 transition-all duration-200 ease-out
                 group-hover:text-black group-hover:translate-x-1"
            aria-hidden="true"
        >
      ›
    </span>
    );
}

export default function HomePage() {
    const t = useTranslations("home");

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

            <main className="min-h-screen bg-white pt-[80px]">
                {/* HERO + 3S */}
                <section className="px-6 pt-10 pb-14 md:pt-16 md:pb-20 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                        {/* HERO */}
                        <div>
                            <h1
                                className="max-w-[12ch] m-0 p-0 font-sans font-bold tracking-[-0.03em] leading-[1.02] text-left
                           text-[54px] sm:text-[64px] md:text-[78px] lg:text-[92px] xl:text-[110px]"
                            >
                                <TextLines text={t("hero.title")} />
                            </h1>
                        </div>

                        {/* 3S PROMISE */}
                        <div className="mt-2 lg:mt-0">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 md:mb-8">
                                {t("promise.title")}
                            </h2>

                            <div className="space-y-6">
                                {promise.map((it) => (
                                    <Link key={it.id} href={`/definition/#${it.id}`} className="group block">
                                        <div
                                            className="
                        rounded-2xl
                        -mx-2 px-2 py-2
                        md:-mx-4 md:px-4 md:py-4
                        md:hover:bg-black/[0.03]
                        md:hover:shadow-[0_18px_60px_-45px_rgba(0,0,0,0.25)]
                        md:hover:-translate-y-0.5
                        transition-all duration-200 ease-out
                        motion-reduce:transition-none motion-reduce:hover:transform-none
                      "
                                        >
                                            <div className="flex items-baseline justify-between gap-6">
                                                <h3 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]">
                                                    {it.title}
                                                </h3>
                                                <Arrow />
                                            </div>

                                            <p className="mt-3 text-black/70 text-base md:text-lg leading-relaxed max-w-[48ch]">
                                                {it.desc}
                                            </p>

                                            {/* underline animation */}
                                            <span className="mt-5 block h-px w-0 bg-black/25 transition-all duration-200 ease-out group-hover:w-full" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* VIDEO */}
                <section className="py-14 md:py-20">
                    <div className="px-6 max-w-4xl mx-auto mb-6 md:mb-8">
                        <p className="text-sm text-gray-500 mb-2">{t("video.kicker")}</p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            {t("video.title")}
                        </h2>
                    </div>

                    <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden">
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                            <source src="/videos/live-video.mp4" type="video/mp4" />
                        </video>

                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                </section>

                {/* EXPERIENCE */}
                <section className="px-6 py-14 md:py-20 max-w-6xl mx-auto">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-10 md:mb-12">
                        {t("experience.title")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                        {experience.map((it) => (
                            <Link
                                key={it.id}
                                href={`/experience#${it.id}`}
                                className="group block p-6 hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                <p className="text-sm text-gray-500 mb-2">{it.kicker}</p>
                                <h3 className="text-2xl md:text-3xl font-bold mb-3">{it.title}</h3>
                                <p className="text-gray-600 mb-4">{it.desc}</p>

                                <p className="text-lg font-semibold flex items-center gap-2">
                                    {it.price}
                                    <span className="transition-transform group-hover:translate-x-1">›</span>
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