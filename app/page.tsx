"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export default function HomePage() {
    return (
        <>
        <Header/>
        <main className="min-h-screen bg-white mt-[80px]">
            {/* Hero + 3S Promise - Two columns on desktop */}
            <section className="px-6 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Hero - Left Column */}
                    <div>
                        <h1 className="max-w-[9ch] m-0 p-0 font-sans font-bold tracking-tight leading-[1.05] text-left
           text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                            Your
                            <br />
                            premium
                            <br />
                            home
                            <br />
                            cleaning
                            <br />
                            service in
                            <br />
                            Stuttgart!
                        </h1>
                    </div>

                    {/* 3S Promise - Right Column */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold mb-8 lg:mb-12">3S-Clean Promise:</h2>

                        <div className="space-y-6">
                            {/* SAUBER */}
                            <Link
                                href="/definition/#sauber"
                                className="group flex items-start justify-between py-4 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                                        SAUBER
                                    </h3>
                                    <p className="text-gray-600 text-base lg:text-lg">
                                        A first-class feel-good atmosphere in your home. Tailor-designed service packages to suit you. Eco-friendly cleaning products.
                                    </p>
                                </div>
                                <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors mt-2 flex-shrink-0 ml-4" />
                            </Link>

                            {/* SICHER */}
                            <Link
                                href="/definition/#sicher"
                                className="group flex items-start justify-between py-4 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                                        SICHER
                                    </h3>
                                    <p className="text-gray-600 text-base lg:text-lg">
                                        You are always in control thanks to live video monitoring. Fixed and transparent prices.
                                    </p>
                                </div>
                                <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors mt-2 flex-shrink-0 ml-4" />
                            </Link>

                            {/* SOUVERÄN */}
                            <Link
                                href="/definition/#souveran"
                                className="group flex items-start justify-between py-4 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                                        SOUVERÄN
                                    </h3>
                                    <p className="text-gray-600 text-base lg:text-lg">
                                        Employees who love what they do always deliver a great result. And you save up on taxes.
                                    </p>
                                </div>
                                <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors mt-2 flex-shrink-0 ml-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="py-16 md:py-24">
                <div className="px-6 max-w-4xl mx-auto mb-8">
                    <p className="text-sm text-gray-500 mb-2">3S-Clean Stream</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        BEHIND THE SCENES
                    </h2>
                </div>
                <div className="w-full aspect-video bg-gray-900 relative overflow-hidden">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/live-video.mp4" type="video/mp4" />
                    </video>
                    {/* Fallback gradient if no videos */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 -z-10" />
                </div>
            </section>

            {/* Experience Section */}
            <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
                <h2 className="text-xl md:text-2xl font-semibold mb-12">3S-Clean Experience</h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Maintenance */}
                    <Link
                        href="/experience#maintenance"
                        className="group block p-6 hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                        <p className="text-sm text-gray-500 mb-2">Weekly or bi-weekly</p>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Maintenance</h3>
                        <p className="text-gray-600 mb-4">
                            Cleaning to keep your home tidy and fresh.
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                            From €120 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </p>
                    </Link>

                    {/* Reset */}
                    <Link
                        href="/experience#reset"
                        className="group block p-6 hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                        <p className="text-sm text-gray-500 mb-2">Intensive cleaning for a &#34;reset&#34;</p>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Reset</h3>
                        <p className="text-gray-600 mb-4">
                            A deeper clean when your home needs extra attention.
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                            From €200 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </p>
                    </Link>

                    {/* Initial */}
                    <Link
                        href="/experience#initial"
                        className="group block p-6 hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                        <p className="text-sm text-gray-500 mb-2">For new clients</p>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Initial</h3>
                        <p className="text-gray-600 mb-4">
                            Bring your home to a level where it can be efficiently maintained thereafter.
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                            From €165 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </p>
                    </Link>

                    {/* Handover */}
                    <Link
                        href="/experience#handover"
                        className="group block p-6 hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                        <p className="text-sm text-gray-500 mb-2">Move-in / Move-out</p>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Handover</h3>
                        <p className="text-gray-600 mb-4">
                            Specialized cleaning before handover to landlord or before moving in.
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                            From €220 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </p>
                    </Link>
                </div>
            </section>
        </main>
            <Footer/>
</>
    );
}
