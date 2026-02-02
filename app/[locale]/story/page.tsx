import {  Video, DollarSign, Users, Shield, Check } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const problems = [
    {
        icon: Video,
        title: "The visibility and accountability gap",
        description:
            "Most clients have no idea what happens during a cleaning unless they sit there and watch. That's not trust — it's blind faith. We introduced video documentation to solve the biggest trust problem in this industry. You can watch a live stream or review afterward. No guessing. No awkward questions and conversations.",
    },
    {
        icon: DollarSign,
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
    { title: "Sauber", description: "Clearly defined standards and consistent results" },
    { title: "Sicher", description: "Safety and liability, with transparent pricing" },
    { title: "Souverän", description: "Predictable delivery by people who feel secure in their job" },
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
    { value: "20%", label: "Tax deduction", sublabel: "up to" },
    { value: "100%", label: "Liability insurance", sublabel: "" },
    { value: "7", label: "Days video access", sublabel: "up to" },
    { value: "24h", label: "Free cancellation", sublabel: "before appointment" },
];

export default function InsidePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[var(--background)] pt-[80px]">
                {/* Hero */}
                <section className="mx-auto max-w-4xl px-6 pb-8 md:pt-20 md:pb-16  pt-[90px] sm:pt-[86px]">
                    <p className={`
                        inline-block whitespace-nowrap 
                        px-4 sm:px-5 md:px-7
                        font-sans font-bold text-left text-[var(--text)] mb-6
                        tracking-[0.05em]
                        text-[23px] leading-[2.2rem] 
                        sm:text-[26px] sm:leading-[2rem]
                        md:text-[29px] md:leading-[2rem]
                        xl:text-[32px] xl:leading-[3rem]
                        `}>
                        3-S Story.
                    </p>
                    <h1 className={`
                        min-w-0
                        font-sans font-semibold tracking-[0em] text-[var(--text)]
                        text-[43px] leading-[4rem]
                        sm:text-[48px] sm:leading-[4rem]
                        md:text-[50px] md:leading-[3rem]
                        xl:text-[52px] xl:leading-[3rem]
                    `}>
                        Home cleaning redefined
                    </h1>
                    <p className="max-w-3xl text-left text-[var(--text)] text-[15px] leading-[1.2rem] md:text-lg mb-5 mt-5">
                        The home-cleaning market seems to be stuck in the past: clients fear something can go
                        horribly wrong with their home without supervision, pricing is often a mystery, and
                        cleaners too often get treated like disposable labor.
                    </p>
                </section>

                {/* Mission Statement */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <div className="rounded-2xl bg-[var(--primary)] p-8 text-[var(--primary-text)] md:p-12">
                        <p className="mb-6 text-2xl font-bold leading-snug md:text-3xl">
                            That is why 3S-Clean is designed not to &#34;compete.&#34; We&#39;re here to reset the standard.
                        </p>
                        <p className="text-lg leading-relaxed opacity-80">
                            3S-Clean is a premium cleaning service built on one simple belief: if you&#39;re letting
                            someone into your home, you deserve clarity—on quality, on safety, and on fairness.
                            And the person performing the service deserves respect and security.
                        </p>
                    </div>
                </section>

                {/* The Story */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <h2 className="mb-8 text-3xl font-bold text-[var(--text)] md:text-4xl">
                        The story behind 3S
                    </h2>
                    <div className="space-y-6 text-lg leading-relaxed text-[var(--muted)]">
                        <p>
                            When one of the people behind the 3S-Clean concept moved to Germany in 2022, like many
                            newcomers, he had to fight for stability: changing his life-long habits, building
                            trust, making new connections, and becoming an active, contributing member in a new
                            society.
                        </p>
                        <p>
                            What helped him stay grounded was something surprisingly simple: cleaning his own
                            home. He enjoys the process—because it&#39;s honest work, it shows results, and it
                            restores control when everything else may feel uncertain. But to most people home
                            cleaning is a black box: they do not have the time, do not know where to start, and
                            are reluctant to hire help.
                        </p>
                        <p className="font-medium text-[var(--text)]">
                            Home cleaning still remains a black box for most. But what if one could incorporate
                            technology into the process and open it up? That is how the idea of 3S-Clean was
                            conceived.
                        </p>
                    </div>
                </section>

                {/* What We Fix */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <h2 className="mb-4 text-3xl font-bold text-[var(--text)] md:text-4xl">
                        What we want to fix
                    </h2>
                    <p className="mb-10 text-lg text-[var(--muted)]">(that others ignore)</p>

                    <div className="space-y-4">
                        {problems.map((problem, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]">
                                        <problem.icon className="h-5 w-5 text-[var(--primary-text)]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text)]">{problem.title}</h3>
                                </div>
                                <p className="leading-relaxed text-[var(--muted)]">{problem.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Our Approach - 3S */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <h2 className="mb-4 text-3xl font-bold text-[var(--text)] md:text-4xl">Our approach</h2>
                    <p className="mb-10 text-lg text-[var(--muted)]">
                        We designed 3S-Clean to fix all three problems—using modern processes and modern tools.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3">
                        {approach.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
                            >
                                <h3 className="mb-3 text-2xl font-bold text-[var(--text)] md:text-3xl">
                                    {item.title}
                                </h3>
                                <p className="text-[var(--muted)]">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* What Clients Can Expect */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <h2 className="mb-10 text-3xl font-bold text-[var(--text)] md:text-4xl">
                        What our clients can expect
                    </h2>

                    <div className="space-y-4">
                        {clientBenefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]">
                                        <benefit.icon className="h-5 w-5 text-[var(--primary-text)]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-xl font-bold text-[var(--text)]">{benefit.title}</h3>
                                        <p className="text-[var(--muted)]">{benefit.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                    <h2 className="mb-10 text-3xl font-bold text-[var(--text)] md:text-4xl">
                        Numbers that matter
                    </h2>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center"
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
                    <div className="rounded-2xl bg-[var(--primary)] p-8 text-center text-[var(--primary-text)] md:p-12">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                            We currently serve households across Stuttgart
                        </h2>
                        <p className="text-lg opacity-80">
                            Enter your postal code during booking to confirm coverage instantly.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
                    <h2 className="mb-4 text-3xl font-bold text-[var(--text)] md:text-4xl">
                        Ready for real transparency?
                    </h2>
                    <p className="mb-8 text-lg text-[var(--muted)]">
                        Experience what professional cleaning should be.
                    </p>

                </section>
            </main>
            <Footer />
        </>
    );
}