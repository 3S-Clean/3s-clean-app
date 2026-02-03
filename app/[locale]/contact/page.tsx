"use client";

import {Mail, MapPin, MessageCircle, Phone} from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";
import PillCTA from "@/components/ui/buttons/PillCTA";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT} from "@/components/ui/card/CardFrame";
import BigTitle from "@/components/ui/typography/BigTitle";
import BodyText from "@/components/ui/typography/BodyText";

const businessHours = [
    {day: "Mon – Fri", hours: "08:00 – 18:00"},
    {day: "Saturday", hours: "09:00 – 14:00"},
    {day: "Sunday", hours: "Closed"},
];

const CONTACT_CARD = [CARD_FRAME_BASE, "p-4 md:p-5"].join(" ");

const CONTACT_CARD_HOVER = [
    CARD_FRAME_BASE,
    "select-none transition-all duration-200",
    CARD_FRAME_HOVER_LIFT,
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
    "p-4 md:p-5",
].join(" ");

export default function ContactPage() {
    return (
        <>
            <Header/>

            <main
                className="min-h-screen pb-8 md:pt-20 md:pb-16 pt-[90px] sm:pt-[86px] bg-[var(--background)] text-[var(--text)]">
                {/* Hero: mobile center, md+ left */}
                <section className="pt-12 pb-8 md:pt-20 md:pb-10">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[
                                CONTENT_GUTTER,
                                "px-2 sm:px-4",
                                "max-w-7xl xl:max-w-[1400px] mx-auto",
                                "flex flex-col gap-3",
                                "items-center text-center",
                                "md:items-start md:text-left",
                            ].join(" ")}
                        >
                            <BigTitle>How can we help?</BigTitle>
                            <BodyText>Personal consultation. Quick responses.</BodyText>
                        </div>
                    </div>
                </section>

                {/* Availability first (limited width) */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="mx-auto w-full max-w-4xl">
                                <div className={`${CONTACT_CARD} text-center`}>
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <MapPin className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-lg font-semibold text-[var(--text)]">Availability</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {businessHours.map((item, index) => (
                                            <div key={index} className="flex justify-center items-center gap-6">
                                                <span className="text-[var(--muted)]">{item.day}</span>
                                                <span
                                                    className={`font-medium ${
                                                        item.hours === "Closed" ? "text-[var(--muted)]" : "text-[var(--text)]"
                                                    }`}
                                                >
                          {item.hours}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Phone + Email */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div className={`${CONTACT_CARD_HOVER} text-center`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <Phone className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">Phone</h2>
                                    </div>

                                    <p className="text-[var(--muted)] mb-5">
                                        Direct consultation about cleanings, appointments, or individual questions.
                                    </p>

                                    <a
                                        href="tel:+4917629607551"
                                        className="
                      inline-flex items-center gap-2 mx-auto
                      px-5 py-3 rounded-xl
                      font-medium transition-colors
                      bg-gray-900 text-white hover:bg-gray-800
                      dark:bg-white dark:text-gray-900 dark:hover:bg-white/90
                    "
                                    >
                                        <Phone className="w-4 h-4"/>
                                        <span>+49 176 2960 7551</span>
                                    </a>
                                </div>

                                {/* Email */}
                                <div className={`${CONTACT_CARD_HOVER} text-center`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <Mail className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">Email</h2>
                                    </div>

                                    <p className="text-[var(--muted)] mb-5">
                                        Inquiries, feedback, or report issues. Response within 24 hours.
                                    </p>

                                    <a
                                        href="mailto:kontakt@3s-clean.de"
                                        className="
                      inline-flex items-center gap-2 mx-auto
                      px-5 py-3 rounded-xl
                      font-medium transition-colors
                      bg-gray-900 text-white hover:bg-gray-800
                      dark:bg-white dark:text-gray-900 dark:hover:bg-white/90
                    "
                                    >
                                        <Mail className="w-4 h-4"/>
                                        <span>kontakt@3s-clean.de</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WhatsApp + Business */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* WhatsApp */}
                                <div className={`${CONTACT_CARD_HOVER} text-center`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <MessageCircle className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">WhatsApp</h2>
                                    </div>

                                    <p className="text-[var(--muted)] mb-5">
                                        Fastest option for quick questions, schedule changes, or updates.
                                    </p>

                                    <a
                                        href="https://wa.me/491762960755"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                      inline-flex items-center gap-2 mx-auto
                      px-5 py-3 rounded-xl
                      font-medium transition-colors
                      bg-gray-900 text-white hover:bg-gray-800
                      dark:bg-white dark:text-gray-900 dark:hover:bg-white/90
                    "
                                    >
                                        <MessageCircle className="w-4 h-4"/>
                                        <span>Start chat</span>
                                    </a>
                                </div>

                                {/* Business */}
                                <div className={`${CONTACT_CARD_HOVER} text-center`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <Mail className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">Business</h2>
                                    </div>

                                    <p className="text-[var(--muted)] mb-5">
                                        Property management, Airbnb hosts, commercial properties, or long-term
                                        cooperation.
                                    </p>

                                    <a
                                        href="mailto:business@3s-clean.de"
                                        className="
                      inline-flex items-center gap-2 mx-auto
                      px-5 py-3 rounded-xl
                      font-medium transition-colors
                      bg-gray-900 text-white hover:bg-gray-800
                      dark:bg-white dark:text-gray-900 dark:hover:bg-white/90
                    "
                                    >
                                        <Mail className="w-5 h-5"/>
                                        <span>business@3s-clean.de</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Booking (NOT a card) */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[
                                CONTENT_GUTTER,
                                "px-2 sm:px-4",
                                "max-w-7xl xl:max-w-[1400px] mx-auto",
                                "text-center",
                            ].join(" ")}
                        >
                            <h2 className="text-2xl font-bold mb-3 text-[var(--text)]">Instant Booking</h2>
                            <p className="text-[var(--muted)] mb-6">Transparent pricing. Immediate confirmation.</p>
                            <PillCTA href="/booking" className="mx-auto max-w-[320px]">
                                Book a cleaning
                            </PillCTA>
                        </div>
                    </div>
                </section>

                {/* Privacy Note (center + black text) */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[
                                CONTENT_GUTTER,
                                "px-2 sm:px-4",
                                "max-w-7xl xl:max-w-[1400px] mx-auto",
                                "text-center",
                            ].join(" ")}
                        >
                            <p className="text-[var(--text)] text-sm">
                                Your data is handled confidentially. No marketing. No data sharing.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}