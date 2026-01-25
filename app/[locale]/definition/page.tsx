"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* ---------- Typography (match Home) ---------- */

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

/* ---------- UI helpers ---------- */

function SectionShell({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
        max-w-4xl mr-auto
        rounded-3xl
        bg-[var(--card)]/70 backdrop-blur-sm
        text-[var(--text)]
        p-8 md:p-12
        ring-1 ring-black/5 dark:ring-white/10
      "
        >
            {children}
        </div>
    );
}

function Muted({
                   children,
                   className = "",
               }: {
    children: React.ReactNode;
    className?: string;
}) {
    return <p className={`text-[var(--muted)] ${className}`}>{children}</p>;
}

function Body({ children }: { children: React.ReactNode }) {
    // match Home cards description sizing
    return (
        <div className="space-y-6 text-base md:text-lg leading-relaxed text-[var(--muted)]">
            {children}
        </div>
    );
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="
        font-semibold text-[var(--text)]
        underline underline-offset-4
        decoration-black/20 dark:decoration-white/25
        hover:decoration-black/50 dark:hover:decoration-white/60
      "
        >
            {children}
        </Link>
    );
}

/* ---------- hash scroll fix ---------- */

function HashScrollFix() {
    useEffect(() => {
        const scrollToHash = (behavior: ScrollBehavior = "auto") => {
            const hash = window.location.hash?.slice(1);
            if (!hash) return;

            const el = document.getElementById(hash);
            if (!el) return;

            el.scrollIntoView({ behavior, block: "start" });
        };

        requestAnimationFrame(() => scrollToHash("auto"));
        requestAnimationFrame(() => scrollToHash("auto"));

        const onHashChange = () => scrollToHash("smooth");
        window.addEventListener("hashchange", onHashChange);

        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return null;
}

export default function DefinitionPage() {
    const t = useTranslations("definition");

    return (
        <>
            <Header />
            <HashScrollFix />

            <main className="min-h-screen mt-[80px] bg-[var(--background)] text-[var(--text)] overflow-x-hidden">
                {/* Hero (left aligned) */}
                <section className="px-6 pt-10 pb-6 md:pt-16 md:pb-10 max-w-4xl mr-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        {t("hero.title")}
                    </h1>
                </section>

                {/* SAUBER */}
                <section id="sauber" className="px-6 py-10 md:py-14 scroll-mt-[96px]">
                    <SectionShell>
                        <div className="mb-8">
                            <BigTitle className="block mb-2 leading-none">{t("sauber.title")}</BigTitle>
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

                        <Muted className="mt-8 text-sm font-medium tracking-wider uppercase">
                            {t("sauber.footer")}
                        </Muted>
                    </SectionShell>
                </section>

                {/* SICHER */}
                <section id="sicher" className="px-6 py-10 md:py-14 scroll-mt-[96px]">
                    <SectionShell>
                        <div className="mb-8">
                            <BigTitle className="block mb-2 leading-none">{t("sicher.title")}</BigTitle>
                            <Muted className="italic text-lg">{t("sicher.subtitle")}</Muted>
                        </div>

                        <Body>
                            <p>
                                {t("sicher.p1.before")}{" "}
                                <strong className="text-[var(--text)]">{t("sicher.p1.strong")}</strong>{" "}
                                {t("sicher.p1.after")}
                            </p>

                            <p>
                                {t("sicher.p2.before")}{" "}
                                <InlineLink href="/contact">{t("links.contact")}</InlineLink>{" "}
                                {t("sicher.p2.after")}
                            </p>

                            <p>
                                <strong className="text-[var(--text)]">{t("sicher.p3.strong")}</strong>{" "}
                                {t("sicher.p3.after")}
                            </p>

                            <p>
                                {t("sicher.p4.before")}{" "}
                                <InlineLink href="/experience">{t("links.experience")}</InlineLink>{" "}
                                {t("sicher.p4.after")}
                            </p>
                        </Body>

                        <Muted className="mt-8 text-sm font-medium tracking-wider uppercase">
                            {t("sicher.footer")}
                        </Muted>
                    </SectionShell>
                </section>

                {/* SOUVERÄN */}
                <section id="souveran" className="px-6 py-10 md:py-14 scroll-mt-[96px]">
                    <SectionShell>
                        <div className="mb-8">
                            <BigTitle className="block mb-2 leading-none">{t("souveran.title")}</BigTitle>
                            <Muted className="italic text-lg">{t("souveran.subtitle")}</Muted>
                        </div>

                        <Body>
                            <p>{t("souveran.p1")}</p>
                            <p>{t("souveran.p2")}</p>

                            <p>
                                <strong className="text-[var(--text)]">{t("souveran.p3.strong")}</strong>{" "}
                                {t("souveran.p3.after")}
                            </p>

                            <p>
                                {t("souveran.p4.before")}{" "}
                                <strong className="text-[var(--text)]">{t("souveran.p4.strong")}</strong>{" "}
                                {t("souveran.p4.after")}
                            </p>
                        </Body>

                        <Muted className="mt-8 text-sm font-medium tracking-wider uppercase">
                            {t("souveran.footer")}
                        </Muted>
                    </SectionShell>
                </section>

                {/* CTA */}
                <section className="px-6 pt-12 pb-16 md:pt-16 md:pb-24 max-w-4xl mr-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("cta.title")}</h2>

                    <Link
                        href="/experience"
                        className="
              inline-flex items-center gap-2
              bg-[var(--text)] text-[var(--background)]
              px-8 py-4 rounded-full font-medium
              hover:opacity-90 transition-opacity
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