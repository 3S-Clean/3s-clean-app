"use client";

import {Check, Euro, Shield, Users, Video} from "lucide-react";
import {Footer, Header} from "@/shared/layout";
import {
    BodyMuted,
    BodyText,
    CARD_FRAME_BASE,
    CONTENT_GUTTER,
    PAGE_CONTAINER,
    PageTitle,
    PillCTA,
    SectionTitle
} from "@/shared/ui";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";

const problemsIcons = [Video, Euro, Users] as const;
const benefitIcons = [Video, Check, Shield] as const;

export default function InsidePage() {
    const t = useTranslations("inside");
    const pathname = usePathname();
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const problems = [
        {icon: problemsIcons[0], title: t("problems.0.title"), description: t("problems.0.description")},
        {icon: problemsIcons[1], title: t("problems.1.title"), description: t("problems.1.description")},
        {icon: problemsIcons[2], title: t("problems.2.title"), description: t("problems.2.description")},
    ];

    const approach = [
        {title: t("approach.0.title"), description: t("approach.0.description")},
        {title: t("approach.1.title"), description: t("approach.1.description")},
        {title: t("approach.2.title"), description: t("approach.2.description")},
    ];

    const clientBenefits = [
        {icon: benefitIcons[0], title: t("benefits.0.title"), description: t("benefits.0.description")},
        {icon: benefitIcons[1], title: t("benefits.1.title"), description: t("benefits.1.description")},
        {icon: benefitIcons[2], title: t("benefits.2.title"), description: t("benefits.2.description")},
    ];

    const stats = [
        {value: "20%", label: t("stats.0.label")},
        {value: "100%", label: t("stats.1.label")},
        {value: "7", label: t("stats.2.label")},
        {value: "24h", label: t("stats.3.label")},
    ];

    return (
        <>
            <Header/>
            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* Hero */}
                <section className="pt-10 pb-8 md:pt-16 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={[CONTENT_GUTTER, "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <PageTitle>
                                {t("hero.title")}
                            </PageTitle>
                        </div>
                    </div>
                </section>
                {/* Mission Statement */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle>
                        {t("mission.title")}
                    </SectionTitle>
                    <BodyText className="mb-8 mt-6">
                        {t("mission.lead")}
                    </BodyText>
                    <div className={[CARD_FRAME_BASE, "p-8 md:p-12"].join(" ")}>
                        <SectionTitle className="mb-6">
                            {t("mission.cardTitle")}
                        </SectionTitle>
                        <BodyText className="text-lg leading-relaxed opacity-80">
                            {t("mission.cardBody")}
                        </BodyText>
                    </div>
                </section>
                {/* The Story */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        {t("story.title")}
                    </SectionTitle>
                    <div className="space-y-6 text-lg leading-relaxed text-[var(--muted)]">
                        <BodyText>
                            {t("story.p1")}
                        </BodyText>
                        <BodyText>
                            {t("story.p2")}
                        </BodyText>
                        <BodyText>
                            {t("story.p3")}
                        </BodyText>
                    </div>
                </section>
                {/* What We Fix */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        {t("fix.title")}
                    </SectionTitle>
                    <div className="space-y-4">
                        {problems.map((problem, index) => (
                            <div key={index}
                                 className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]">
                                        <problem.icon className="h-5 w-5 text-[var(--primary-text)]"/>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text)]">{problem.title}</h3>
                                </div>
                                <p className="text-[clamp(13px,1.6vw,15px)] text-[var(--muted)] leading-relaxed">{problem.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Our Approach - 3S */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">{t("approachTitle")}</SectionTitle>
                    <div className="grid gap-4 md:grid-cols-3">
                        {approach.map((item, index) => (
                            <div
                                key={index}
                                className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}
                            >
                                <h3 className="mb-3 text-2xl font-bold text-[var(--text)] md:text-3xl">
                                    {item.title}
                                </h3>
                                <p className="text-[clamp(12px,1.6vw,15px)] text-[var(--muted)] leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* What Clients Can Expect */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        {t("expect.title")}
                    </SectionTitle>
                    <div className="space-y-4">
                        {clientBenefits.map((benefit, index) => (
                            <div
                                key={index}
                                className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]">
                                        <benefit.icon className="h-5 w-5 text-[var(--primary-text)]"/>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-xl font-bold text-[var(--text)]">{benefit.title}</h3>
                                        <p className="text-[clamp(12px,1.6vw,15px)] text-[var(--muted)] leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Stats */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        {t("numbers.title")}
                    </SectionTitle>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}
                            >
                                <p className="mb-2 text-3xl font-bold text-[var(--text)] md:text-4xl">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Stuttgart Coverage */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <div className={[CARD_FRAME_BASE, "p-8 md:p-12"].join(" ")}>
                        <SectionTitle className="mb-4">
                            {t("coverage.title")}
                        </SectionTitle>
                        <BodyText className="text-lg opacity-80">
                            {t("coverage.body")}
                        </BodyText>
                    </div>
                </section>
                {/* CTA */}
                <section className="pt-12 pb-16 md:pt-16 md:pb-24 max-w-2xl mx-auto ">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionTitle className="mb-4">
                                {t("cta.title")}
                            </SectionTitle>
                            <BodyMuted className="mb-8">
                                {t("cta.subtitle")}
                            </BodyMuted>
                            <PillCTA href={withLocale("/booking")} className="mt-5">
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
