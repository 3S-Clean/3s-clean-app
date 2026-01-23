'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export default function DefinitionPage() {
    return (
        <>
            <Header/>
            <main className="min-h-screen bg-white mt-[80px] ">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                        3S-Clean Promise:
                    </h1>
                </section>

                {/* SAUBER Section */}
                <section id="sauber" className="px-6 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                SAUBER
                            </h2>
                            <p className="text-gray-600 italic text-lg">
                                — a home that feels light, healthy, and ready for life.
                            </p>
                        </div>

                        <div className="space-y-6 text-gray-700 leading-relaxed">
                            <p>
                                Failure to regularly clean your home leads to built-up clutter, allergens, increased health risks, and a space that simply feels uncomfortable. Life in your own home becomes stressful, not to mention inviting family or friends. But most people don&#39;t have the time, experience, or energy to manage this chore – we get it!
                            </p>
                            <p>
                                That&#39;s where we come in.
                            </p>
                            <p>
                                We have custom-tailored different <strong>3S-Clean Experiences</strong> to meet your specific needs and keep your home permanently clean. You decide how often and what you want cleaned. It goes without saying that we use eco-friendly cleaning products and are properly equipped to deliver a spotless, refreshed result every time.
                            </p>
                        </div>

                        <p className="mt-8 text-sm font-medium text-gray-500 tracking-wider">
                            3S-CLEAN — SAUBER. JEDES MAL.
                        </p>
                    </div>
                </section>

                {/* SICHER Section */}
                <section id="sicher" className="px-6 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-3xl p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                SICHER
                            </h2>
                            <p className="text-gray-300 italic text-lg">
                                — trust you can verify, not just hope for.
                            </p>
                        </div>

                        <div className="space-y-6 text-gray-300 leading-relaxed">
                            <p>
                                It can be stressful to let a stranger into your home – trust is not something given but must be gained. To guarantee your peace of mind we use <strong className="text-white">GoPro cameras worn by our employees throughout every cleaning session</strong> – you can view a live-stream video, transmitted via a secure link, or review a video report at a later time within 7 days.
                            </p>
                            <p>
                                This way you are always in control and know exactly what is going on in your home even if you are not there at time of cleaning. If anything ever feels unclear, simply review the footage and contact us — we&#39;re here to support you with complete transparency and professionalism.
                            </p>
                            <p>
                                <strong className="text-white">Your privacy is non-negotiable.</strong> No information identifying you or location and details of your home will be shared with anyone. Only authorized personnel have access to videos that are deleted from our secure servers after 7 days.
                            </p>
                            <p>
                                Our pricing is absolutely transparent — no ambiguous hourly-rates or hidden fees. You don&#39;t get estimates, but firm comprehensive offers based on the information you provide at time of booking. Just choose the <strong className="text-white">3S-Clean Experience</strong> that is right for you!
                            </p>
                        </div>

                        <p className="mt-8 text-sm font-medium text-gray-500 tracking-wider">
                            3S-CLEAN — SAUBER. JEDES MAL.
                        </p>
                    </div>
                </section>

                {/* SOUVERÄN Section */}
                <section id="souveran" className="px-6 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                                SOUVERÄN
                            </h2>
                            <p className="text-gray-600 italic text-lg">
                                — calm execution, consistent results.
                            </p>
                        </div>

                        <div className="space-y-6 text-gray-700 leading-relaxed">
                            <p>
                                Every 3S-CLEAN specialist is trained, vetted, and employed directly by us — never a freelancer. That gives you reliability, accountability, and a consistent standard every time.
                            </p>
                            <p>
                                We hire people who genuinely enjoy cleaning and take pride in doing it right. We invest not only in equipment and proven cleaning products — but, more importantly, in our people: training, checklists, and a culture of ownership.
                            </p>
                            <p>
                                <strong>Quality is actively managed.</strong> We regularly review video reports to keep performance sharp and service reliable. And if something ever goes wrong, you&#39;re covered: liability insurance is provided.
                            </p>
                            <p>
                                There is also an economic upside for our clients: get up to <strong>20% of your annual cleaning expenditure back</strong> through tax reduction according to §35a EStG: simply retain the invoices and convert routine cleaning into measurable financial efficiency.
                            </p>
                        </div>

                        <p className="mt-8 text-sm font-medium text-gray-500 tracking-wider">
                            3S-CLEAN — SAUBER. JEDES MAL.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Explore the 3S Experience
                    </h2>
                    <Link
                        href="/experience"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </main>
            <Footer/>
        </>

    );
}
