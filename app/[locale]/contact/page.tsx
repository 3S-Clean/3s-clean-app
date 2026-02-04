"use client";

import {Mail, MapPin, MessageCircle, Phone} from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";
import PillCTA from "@/components/ui/buttons/PillCTA";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT} from "@/components/ui/card/CardFrame";
import PageTitle from "@/components/ui/typography/PageTitle";
import PageSubtitle from "@/components/ui/typography/PageSubtitle";
import SectionTitle from "@/components/ui/typography/SectionTitle"
import BodyText from "@/components/ui/typography/BodyText";

const businessHours = [
    {day: "Mon – Fri", hours: "08:00 – 18:00"},
    {day: "Saturday", hours: "09:00 – 14:00"},
    {day: "Sunday", hours: "Closed"},
];

// чуть компактнее, как ты просил
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
                className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* Hero: */}
                <section className="pt-10 pb-8 md:pt-16 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}
                        >
                            <PageTitle className="mb-6">How can we help?</PageTitle>
                            <PageSubtitle>Personal consultation. Quick responses.</PageSubtitle>
                        </div>
                    </div>
                </section>
                {/* Availability first:*/}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="w-full max-w-4xl md:max-w-xl lg:max-w-2xl mx-0 md:mx-auto">
                                <div className={`${CONTACT_CARD} text-left`}>
                                    <div className="flex items-center justify-start gap-3 mb-4">
                                        <MapPin className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>Availability</SectionTitle>
                                    </div>
                                    <div className="space-y-3">
                                        {businessHours.map((item, index) => (
                                            <div key={index} className="flex justify-start items-center gap-6">
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
                {/* Phone + Email: always left inside cards */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6">
                                {/* Phone */}
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <Phone className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>Phone</SectionTitle>
                                    </div>
                                    <BodyText className="mb-5">
                                        Direct consultation about cleanings, appointments, or individual questions.
                                    </BodyText>
                                    <a
                                        href="tel:+4917629607551"
                                        className="
                                          inline-flex items-center gap-2
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
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <Mail className="w-5 h-5 text-[var(--text)]"/>
                                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">Email</h2>
                                    </div>
                                    <BodyText className="mb-5">
                                        Inquiries, feedback, or report issues. Response within 24 hours.
                                    </BodyText>
                                    <a
                                        href="mailto:kontakt@3s-clean.de"
                                        className="
                                          inline-flex items-center gap-2
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
                {/* WhatsApp + Business: always left inside cards */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6">
                                {/* WhatsApp */}
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <MessageCircle className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>WhatsApp</SectionTitle>
                                    </div>
                                    <BodyText className="mb-5">
                                        Fastest option for quick questions, schedule changes, or updates.
                                    </BodyText>
                                    <a
                                        href="https://wa.me/491762960755"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                          inline-flex items-center gap-2
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
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <Mail className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>Business</SectionTitle>
                                    </div>
                                    <BodyText className="mb-5">
                                        Property management, Airbnb hosts, commercial properties, or long-term
                                        cooperation.
                                    </BodyText>
                                    <a
                                        href="mailto:business@3s-clean.de"
                                        className="
                                          inline-flex items-center gap-2
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
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[
                                CONTENT_GUTTER,
                                "px-2 sm:px-4",
                                "max-w-7xl xl:max-w-[1400px] mx-auto",
                                "text-left md:text-center",
                            ].join(" ")}
                        >
                            <SectionTitle>Instant Booking</SectionTitle>
                            <BodyText className="mb-5">Transparent pricing. Immediate confirmation.</BodyText>
                            <PillCTA href="/booking" className="max-w-[320px] md:mx-auto">
                                Book a cleaning
                            </PillCTA>
                        </div>
                    </div>
                </section>
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div className={[
                            CONTENT_GUTTER,
                            "px-2 sm:px-4",
                            "max-w-7xl xl:max-w-[1400px] mx-auto",
                            "text-left md:text-center",
                        ].join(" ")}
                        >
                            <BodyText>
                                Your data is handled confidentially. No marketing. No data sharing.
                            </BodyText>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}