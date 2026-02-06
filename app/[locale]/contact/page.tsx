"use client";

import {Mail, MapPin, MessageCircle, Phone} from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT} from "@/components/ui/card/CardFrame";
import PageTitle from "@/components/ui/typography/PageTitle";
import PageSubtitle from "@/components/ui/typography/PageSubtitle";
import SectionTitle from "@/components/ui/typography/SectionTitle";
import BodyText from "@/components/ui/typography/BodyText";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";

type HoursItem = { day: string; hours: string };

const CONTACT_CARD = [CARD_FRAME_BASE, "px-6 md:px-8 py-7 md:py-8"].join(" ");
const CONTACT_CARD_HOVER = [
    CARD_FRAME_BASE,
    "select-none transition-all duration-200",
    CARD_FRAME_HOVER_LIFT,
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
    "px-6 md:px-8 py-7 md:py-8",
].join(" ");

export default function ContactPage() {
    const t = useTranslations("contact");

    const pathname = usePathname();
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const businessHours: HoursItem[] = [
        {day: t("hours.monFri"), hours: t("hours.monFriTime")},
        {day: t("hours.sat"), hours: t("hours.satTime")},
        {day: t("hours.sun"), hours: t("hours.sunTime")},
    ];

    return (
        <>
            <Header/>
            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* Hero */}
                <section className="pt-10 pb-8 md:pt-16 md:pb-12">
                    <div className={PAGE_CONTAINER}>
                        <div className={CONTENT_GUTTER}>
                            <PageTitle className="mb-6">{t("hero.title")}</PageTitle>
                            <PageSubtitle>{t("hero.subtitle")}</PageSubtitle>
                        </div>
                    </div>
                </section>

                {/* Availability */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="w-full max-w-4xl md:max-w-xl lg:max-w-2xl mx-0 md:mx-auto">
                                <div className={`${CONTACT_CARD} text-left`}>
                                    <div className="flex items-center justify-start gap-3 mb-4">
                                        <MapPin className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>{t("availability.title")}</SectionTitle>
                                    </div>

                                    <div className="space-y-3">
                                        {businessHours.map((item, index) => (
                                            <div key={index} className="flex justify-start items-center gap-6">
                                                <span className="text-[var(--muted)]">{item.day}</span>
                                                <span
                                                    className={`font-medium ${
                                                        item.hours === t("hours.closed") ? "text-[var(--muted)]" : "text-[var(--text)]"
                                                    }`}
                                                >
                          {item.hours}
                        </span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-4 text-sm text-[var(--muted)]">{t("availability.note")}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6">
                                {/* Phone */}
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <Phone className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>{t("phone.title")}</SectionTitle>
                                    </div>

                                    <BodyText className="mb-5">{t("phone.body")}</BodyText>

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
                                        <SectionTitle>{t("email.title")}</SectionTitle>
                                    </div>
                                    <BodyText className="mb-5">{t("email.body")}</BodyText>
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

                {/* WhatsApp + Business */}
                <section className="py-8">
                    <div className={PAGE_CONTAINER}>
                        <div
                            className={[CONTENT_GUTTER, "px-2 sm:px-4", "max-w-7xl xl:max-w-[1400px] mx-auto"].join(" ")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6">
                                {/* WhatsApp */}
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <MessageCircle className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>{t("whatsapp.title")}</SectionTitle>
                                    </div>

                                    <BodyText className="mb-5">{t("whatsapp.body")}</BodyText>

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
                                        <span>{t("whatsapp.cta")}</span>
                                    </a>
                                </div>

                                {/* Business */}
                                <div className={CONTACT_CARD_HOVER}>
                                    <div className="flex items-center justify-start gap-3 mb-3">
                                        <Mail className="w-5 h-5 text-[var(--text)]"/>
                                        <SectionTitle>{t("business.title")}</SectionTitle>
                                    </div>

                                    <BodyText className="mb-5">{t("business.body")}</BodyText>

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
                {/* Privacy note */}
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
                            <BodyText>{t("privacyNote")}</BodyText>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </>
    );
}