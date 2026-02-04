import {Check, Euro, Shield, Users, Video} from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {CARD_FRAME_BASE} from "@/components/ui/card/CardFrame";
import PageTitle from "@/components/ui/typography/PageTitle";
import BodyText from "@/components/ui/typography/BodyText";
import SectionTitle from "@/components/ui/typography/SectionTitle";
import BodyMuted from "@/components/ui/typography/BodyMuted";
import PillCTA from "@/components/ui/buttons/PillCTA";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";

const problems = [
    {
        icon: Video,
        title: "The visibility and accountability gap",
        description:
            "Most clients have no idea what happens during a cleaning unless they sit there and watch. That's not trust — it's blind faith. We introduced video documentation to solve the biggest trust problem in this industry. You can watch a live stream or review afterward. No guessing. No awkward questions and conversations.",
    },
    {
        icon: Euro,
        title: "The pricing mess",
        description:
            "Most cleaning service providers charge per hour, which sounds simple—until it isn't. Clients often feel like they end up paying for time, not value. We're moving away from vague time-based logic toward clearly defined work scopes, backed by proof and consistency—so pricing becomes understandable. And clients can also save on cleaning expenses: up to 20% through tax reduction according to §35a EStG.",
    },
    {
        icon: Users,
        title: "Unfair working conditions",
        description:
            'A lot of cleaning happens in gray zones. Cleaners have no security, cash jobs mean no pensions, no proper medical coverage, no stability. That\'s not "efficient"—that is broken. Our model is built to support real employment, training, and long-term working dignity—because quality and fairness scale together.',
    },
];

const approach = [
    {title: "Sauber", description: "Clearly defined standards and consistent results"},
    {title: "Sicher", description: "Safety and liability, with transparent pricing"},
    {title: "Souverän", description: "Predictable delivery by people who feel secure in their job"},
];

const clientBenefits = [
    {
        icon: Video,
        title: "Video documentation",
        description: "You can watch a live stream or review later. No uncertainty and measurable quality.",
    },
    {
        icon: Check,
        title: "Scope-based service",
        description:
            "We focus on what gets done—not just how long someone was present—so pricing becomes understandable and fair.",
    },
    {
        icon: Shield,
        title: "Secure employment",
        description:
            "Our cleaners are officially employed, trained, and insured. We want people to do this work with dignity so that our clients can rely on consistency.",
    },
];

const stats = [
    {value: "20%", label: "Tax deduction", sublabel: "up to"},
    {value: "100%", label: "Liability insurance", sublabel: ""},
    {value: "7", label: "Days video access", sublabel: "up to"},
    {value: "24h", label: "Free cancellation", sublabel: "before appointment"},
];

export default function InsidePage() {
    return (
        <>
            <Header/>
            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* Hero */}
                <section className="pt-[90px] sm:pt-[86px] pb-8 md:pt-20 md:pb-16">
                    <div className={PAGE_CONTAINER}>
                        <div className={[CONTENT_GUTTER, "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <PageTitle className="mb-6">
                                3-S Story
                            </PageTitle>
                        </div>
                    </div>
                </section>
                {/* Mission Statement */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle>
                        Home cleaning redefined
                    </SectionTitle>
                    <BodyText className="mb-8 mt-6">
                        The home-cleaning market seems to be stuck in the past: clients fear something can go
                        horribly wrong with their home without supervision, pricing is often a mystery, and
                        cleaners too often get treated like disposable labor.
                    </BodyText>
                    <div className={[CARD_FRAME_BASE, "p-8 md:p-12"].join(" ")}>
                        <SectionTitle className="mb-6">
                            That is why 3S-Clean is designed not to &#34;compete.&#34; We&#39;re here to reset the
                            standard.
                        </SectionTitle>
                        <BodyText className="text-lg leading-relaxed opacity-80">
                            3S-Clean is a premium cleaning service built on one simple belief: if you&#39;re letting
                            someone into your home, you deserve clarity—on quality, on safety, and on fairness.
                            And the person performing the service deserves respect and security.
                        </BodyText>
                    </div>
                </section>
                {/* The Story */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        The vision behind 3S
                    </SectionTitle>
                    <div className="space-y-6 text-lg leading-relaxed text-[var(--muted)]">
                        <BodyText>
                            When one of the people behind the 3S-Clean concept moved to Germany in 2022, like many
                            newcomers, he had to fight for stability: changing his life-long habits, building
                            trust, making new connections, and becoming an active, contributing member in a new
                            society.
                        </BodyText>
                        <BodyText>
                            What helped him stay grounded was something surprisingly simple: cleaning his own
                            home. He enjoys the process—because it&#39;s honest work, it shows results, and it
                            restores control when everything else may feel uncertain. But to most people home
                            cleaning is a black box: they do not have the time, do not know where to start, and
                            are reluctant to hire help.
                        </BodyText>
                        <BodyText>
                            Home cleaning still remains a black box for most. But what if one could incorporate
                            technology into the process and open it up? That is how the idea of 3S-Clean was
                            conceived.
                        </BodyText>
                    </div>
                </section>
                {/* What We Fix */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">
                        What we want to fix
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
                                <p className="text-[clamp(12px,1.6vw,15px)] text-[var(--muted)] leading-relaxed">{problem.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Our Approach - 3S */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <SectionTitle className="mb-6">Our approach</SectionTitle>
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
                        What our clients can expect
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
                        Numbers that matter
                    </SectionTitle>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}
                            >
                                {stat.sublabel && (
                                    <p className="mb-1 text-sm text-[var(--muted)]">{stat.sublabel}</p>
                                )}
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
                            We currently serve households across Stuttgart
                        </SectionTitle>
                        <BodyText className="text-lg opacity-80">
                            Enter your postal code during booking to confirm coverage instantly.
                        </BodyText>
                    </div>
                </section>
                {/* CTA */}
                <section className="pt-12 pb-16 md:pt-16 md:pb-24 max-w-2xl mx-auto ">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <SectionTitle className="mb-4">
                                Ready for real transparency?
                            </SectionTitle>
                            <BodyMuted className="mb-8">
                                Experience what professional cleaning should be.
                            </BodyMuted>
                            <PillCTA href="/booking" className="mt-5">
                                Book a cleaning now
                            </PillCTA>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}