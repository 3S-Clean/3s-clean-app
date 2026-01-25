"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

function SectionShell({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
        max-w-4xl mx-auto
        rounded-3xl
        bg-gray-50 text-gray-900
        dark:bg-white/5 dark:text-white
        p-8 md:p-12
        ring-1 ring-black/5 dark:ring-white/10
      "
        >
            {children}
        </div>
    );
}

function Muted({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={`text-gray-600 dark:text-white/70 ${className}`}>
            {children}
        </p>
    );
}

function Body({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6 leading-relaxed text-gray-700 dark:text-white/80">
            {children}
        </div>
    );
}

function InlineLink({
                        href,
                        children,
                    }: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="
        font-semibold
        text-gray-900 dark:text-white
        underline underline-offset-4
        decoration-black/20 dark:decoration-white/25
        hover:decoration-black/50 dark:hover:decoration-white/60
      "
        >
            {children}
        </Link>
    );
}

export default function DefinitionPage() {
    const t = useTranslations("definition");

    return (
        <>
            <Header />

            <main className="min-h-screen mt-[80px] bg-white text-gray-900 dark:bg-black dark:text-white">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                        {t("hero.title")}
                    </h1>
                </section>

                {/* SAUBER */}
                <section id="sauber" className="px-6 py-12 md:py-20">
                    <SectionShell>
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                {t("sauber.title")}
                            </h2>
                            <Muted className="italic text-lg">{t("sauber.subtitle")}</Muted>
                        </div>

                        <Body>
                            <p>{t("sauber.p1")}</p>
                            <p>{t("sauber.p2")}</p>
                            <p>
                                {t("sauber.p3.before")}{" "}
                                <InlineLink href="/experience">{t("links.experience")}</InlineLink>{" "}
                                {t("sauber.p3.after")}
                            </p>
                        </Body>

                        <p className="mt-8 text-sm font-medium tracking-wider text-gray-500 dark:text-white/50">
                            {t("sauber.footer")}
                        </p>
                    </SectionShell>
                </section>

                {/* SICHER */}
                <section id="sicher" className="px-6 py-12 md:py-20">
                    <SectionShell>
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                {t("sicher.title")}
                            </h2>
                            <Muted className="italic text-lg">{t("sicher.subtitle")}</Muted>
                        </div>

                        <Body>
                            <p>
                                {t("sicher.p1.before")}{" "}
                                <strong className="text-gray-900 dark:text-white">
                                    {t("sicher.p1.strong")}
                                </strong>{" "}
                                {t("sicher.p1.after")}
                            </p>

                            <p>
                                {t("sicher.p2.before")}{" "}
                                <InlineLink href="/contact">{t("links.contact")}</InlineLink>{" "}
                                {t("sicher.p2.after")}
                            </p>

                            <p>
                                <strong className="text-gray-900 dark:text-white">{t("sicher.p3.strong")}</strong>{" "}
                                {t("sicher.p3.after")}
                            </p>

                            <p>
                                {t("sicher.p4.before")}{" "}
                                <InlineLink href="/experience">{t("links.experience")}</InlineLink>{" "}
                                {t("sicher.p4.after")}
                            </p>
                        </Body>

                        <p className="mt-8 text-sm font-medium tracking-wider text-gray-500 dark:text-white/50">
                            {t("sicher.footer")}
                        </p>
                    </SectionShell>
                </section>

                {/* SOUVERÄN */}
                <section id="souveran" className="px-6 py-12 md:py-20">
                    <SectionShell>
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                {t("souveran.title")}
                            </h2>
                            <Muted className="italic text-lg">{t("souveran.subtitle")}</Muted>
                        </div>

                        <Body>
                            <p>{t("souveran.p1")}</p>
                            <p>{t("souveran.p2")}</p>
                            <p>
                                <strong className="text-gray-900 dark:text-white">
                                    {t("souveran.p3.strong")}
                                </strong>{" "}
                                {t("souveran.p3.after")}
                            </p>
                            <p>
                                {t("souveran.p4.before")}{" "}
                                <strong className="text-gray-900 dark:text-white">{t("souveran.p4.strong")}</strong>{" "}
                                {t("souveran.p4.after")}
                            </p>
                        </Body>

                        <p className="mt-8 text-sm font-medium tracking-wider text-gray-500 dark:text-white/50">
                            {t("souveran.footer")}
                        </p>
                    </SectionShell>
                </section>

                {/* CTA */}
                <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {t("cta.title")}
                    </h2>

                    <Link
                        href="/experience"
                        className="
              inline-flex items-center gap-2
              rounded-full px-8 py-4 font-medium
              bg-gray-900 text-white hover:bg-gray-800
              dark:bg-white dark:text-black dark:hover:bg-white/90
              transition-colors
            "
                    >
                        {t("cta.button")}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </main>

            <Footer />
        </>
    );
}