"use client";

import {useEffect} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {ArrowRight} from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SectionKicker from "@/components/ui/typography/SectionKicker";
import BigTitle from "@/components/ui/typography/BigTitle";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";

function SectionShell({children}: { children: React.ReactNode }) {
    const shellBase = [
        "relative overflow-hidden",
        "w-full rounded-3xl",
        "bg-white text-gray-900",
        "dark:bg-[var(--card)]/70 dark:backdrop-blur-sm dark:text-[var(--text)]",
        "border border-black/5 dark:border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.50)]",
        "p-8 md:p-12",
        "motion-reduce:transition-none",
    ].join(" ");

    return <div className={shellBase}>{children}</div>;
}

function Muted({
                   children,
                   className = "",
               }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-[var(--muted)] text-base md:text-lg leading-relaxed ${className}`}>
            {children}
        </p>
    );
}

function Body({children}: { children: React.ReactNode }) {
    return <div className="space-y-6 text-[var(--muted)] text-base md:text-lg leading-relaxed">{children}</div>;
}

function InlineLink({href, children}: { href: string; children: React.ReactNode }) {
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

            el.scrollIntoView({behavior, block: "start"});
        };

        requestAnimationFrame(() => scrollToHash("auto"));
        requestAnimationFrame(() => scrollToHash("auto"));

        const onHashChange = () => scrollToHash("smooth");
        window.addEventListener("hashchange", onHashChange);

        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return null;
}

export default function PromisePage() {
    const t = useTranslations("promise");

    return (
        <>
            <Header/>
            <HashScrollFix/>
            <main className="pb-8 md:pt-20 md:pb-16 pt-[90px] sm:pt-[86px]">
                <section className="pt-10 pb-8 md:pt-16 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionKicker>{t("hero.title")}</SectionKicker>
                        </div>
                    </div>
                </section>
                {/* SAUBER */}
                <section id="sauber" className="py-10 md:py-14 scroll-mt-[96px]">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <BigTitle as="h2" className="block">{t("sauber.title")}</BigTitle>
                                <Muted className="italic mt-2">{t("sauber.subtitle")}</Muted>
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

                            <p className="mt-10 text-sm font-medium tracking-wider uppercase text-[var(--muted)]">
                                {t("sauber.footer")}
                            </p>
                        </SectionShell>
                    </div>
                </section>

                {/* SICHER */}
                <section id="sicher" className="py-10 md:py-14 scroll-mt-[96px]">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <BigTitle as="h2" className="block">{t("sicher.title")}</BigTitle>
                                <Muted className="italic mt-2">{t("sicher.subtitle")}</Muted>
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

                            <p className="mt-10 text-sm font-medium tracking-wider uppercase text-[var(--muted)]">
                                {t("sicher.footer")}
                            </p>
                        </SectionShell>
                    </div>
                </section>

                {/* SOUVERÄN */}
                <section id="souveran" className="py-10 md:py-14 scroll-mt-[96px]">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <BigTitle as="h2" className="block">{t("souveran.title")}</BigTitle>
                                <Muted className="italic mt-2">{t("souveran.subtitle")}</Muted>
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

                            <p className="mt-10 text-sm font-medium tracking-wider uppercase text-[var(--muted)]">
                                {t("souveran.footer")}
                            </p>
                        </SectionShell>
                    </div>
                </section>

                {/* CTA (можешь оставить по центру — если хочешь тоже слева скажи) */}
                <section className="pt-12 pb-16 md:pt-16 md:pb-24">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("cta.title")}</h2>
                            <Link
                                href="/experience"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                            >
                                {t("cta.button")}
                                <ArrowRight className="w-5 h-5"/>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </>
    );
}