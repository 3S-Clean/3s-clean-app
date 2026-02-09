"use client";

import {useEffect} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {Footer, Header} from "@/shared/layout";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/shared/ui";
import {PillCTA} from "@/shared/ui";
import {PageTitle} from "@/shared/ui";
import {SectionTitle} from "@/shared/ui";
import {CARD_FRAME_BASE} from "@/shared/ui";
import {BodyMuted} from "@/shared/ui";
import {BodyText} from "@/shared/ui";

function SectionShell({children}: { children: React.ReactNode }) {
    const shellBase = [
        CARD_FRAME_BASE,
        "w-full",
        "px-6 md:px-8",
        "py-6 md:py-8",
        "motion-reduce:transition-none",
    ].join(" ");
    return <div className={shellBase}>{children}</div>;
}

function Body({children}: { children: React.ReactNode }) {
    return <div className="space-y-6 ">{children}</div>;
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
                <section className="pt-8 pb-8 md:pt-14 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <PageTitle>{t("hero.title")}</PageTitle>
                        </div>
                    </div>
                </section>
                {/* SAUBER */}
                <section id="sauber" className="py-10 md:py-14 scroll-mt-[96px] max-w-6xl mx-auto">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <SectionTitle className="block">{t("sauber.title")}</SectionTitle>
                                <BodyMuted className="italic mt-2">{t("sauber.subtitle")}</BodyMuted>
                            </div>
                            <Body>
                                <BodyText>{t("sauber.p1")}</BodyText>
                                <BodyText>{t("sauber.p2")}</BodyText>
                                <BodyText>
                                    {t("sauber.p3.before")}{" "}
                                    <InlineLink href="/experience">{t("links.experience")}</InlineLink>{" "}
                                    {t("sauber.p3.after")}
                                </BodyText>
                            </Body>
                            <BodyMuted className="mt-10 font-medium tracking-wider uppercase">
                                {t("sauber.footer")}
                            </BodyMuted>
                        </SectionShell>
                    </div>
                </section>
                {/* SICHER */}
                <section id="sicher" className="py-10 md:py-14 scroll-mt-[96px] max-w-6xl mx-auto">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <SectionTitle className="block">{t("sicher.title")}</SectionTitle>
                                <BodyMuted className="italic mt-2">{t("sicher.subtitle")}</BodyMuted>
                            </div>
                            <Body>
                                <BodyText>
                                    {t("sicher.p1.before")}{" "}
                                    <strong className="text-[var(--text)]">{t("sicher.p1.strong")}</strong>{" "}
                                    {t("sicher.p1.after")}
                                </BodyText>
                                <BodyText>
                                    {t("sicher.p2.before")}{" "}
                                    <InlineLink href="/contact">{t("links.contact")}</InlineLink>{" "}
                                    {t("sicher.p2.after")}
                                </BodyText>
                                <BodyText>
                                    <strong className="text-[var(--text)]">{t("sicher.p3.strong")}</strong>{" "}
                                    {t("sicher.p3.after")}
                                </BodyText>
                                <BodyText>
                                    {t("sicher.p4.before")}{" "}
                                    <InlineLink href="/experience">{t("links.experience")}</InlineLink>{" "}
                                    {t("sicher.p4.after")}
                                </BodyText>
                            </Body>
                            <BodyMuted className="mt-10 font-medium tracking-wider uppercase">
                                {t("sicher.footer")}
                            </BodyMuted>
                        </SectionShell>
                    </div>
                </section>
                {/* SOUVERÄN */}
                <section id="souveran" className="py-10 md:py-14 scroll-mt-[96px] max-w-6xl mx-auto">
                    <div className={PAGE_CONTAINER}>
                        <SectionShell>
                            <div className="mb-8">
                                <SectionTitle className="block">{t("souveran.title")}</SectionTitle>
                                <BodyMuted className="italic mt-2">{t("souveran.subtitle")}</BodyMuted>
                            </div>
                            <Body>
                                <BodyText>{t("souveran.p1")}</BodyText>
                                <BodyText>{t("souveran.p2")}</BodyText>
                                <BodyText>
                                    <strong className="text-[var(--text)]">{t("souveran.p3.strong")}</strong>{" "}
                                    {t("souveran.p3.after")}
                                </BodyText>
                                <BodyText>
                                    {t("souveran.p4.before")}{" "}
                                    <strong className="text-[var(--text)]">{t("souveran.p4.strong")}</strong>{" "}
                                    {t("souveran.p4.after")}
                                </BodyText>
                            </Body>
                            <BodyMuted className="mt-10 font-medium tracking-wider uppercase">
                                {t("souveran.footer")}
                            </BodyMuted>
                        </SectionShell>
                    </div>
                </section>
                {/* CTA */}
                <section className="pt-12 pb-16 md:pt-16 md:pb-24 max-w-2xl mx-auto ">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionTitle className="text-center">{t("cta.title")}</SectionTitle>
                            <PillCTA href="/experience" className="mt-5">
                                {t("cta.button")}
                            </PillCTA>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}
