'use client';

import Link from 'next/link';
import { Phone, Mail, MessageCircle, MapPin, ArrowRight } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const businessHours = [
    { day: 'Mon – Fri', hours: '08:00 – 18:00' },
    { day: 'Saturday', hours: '09:00 – 14:00' },
    { day: 'Sunday', hours: 'Closed' },
];

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-4xl px-6 pb-8 md:pt-20 md:pb-16  pt-[90px] sm:pt-[86px]">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[var(--text)]">
                        Contact
                    </h1>
                    <p className="text-[var(--muted)] text-lg">
                        Personal consultation. Quick responses.
                    </p>
                </section>

                {/* Contact Cards */}
                <section className="px-6 py-8 max-w-4xl mx-auto space-y-4">

                    {/* Phone Card */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <Phone className="w-5 h-5 text-[var(--text)]" />
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">
                                Phone
                            </h2>
                        </div>
                        <p className="text-[var(--muted)] mb-5">
                            Direct consultation about cleanings, appointments, or individual questions.
                        </p>
                        <a
                            href="tel:+4917629607551"
                            className="inline-flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] hover:bg-[var(--border)] px-5 py-3 rounded-xl transition-colors text-[var(--text)]"
                        >
                            <Phone className="w-4 h-4" />
                            <span>+49 176 2960 7551</span>
                        </a>
                    </div>

                    {/* Email Card */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-5 h-5 text-[var(--text)]" />
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">
                                Email
                            </h2>
                        </div>
                        <p className="text-[var(--muted)] mb-5">
                            Inquiries, feedback, or report issues. Response within 24 hours.
                        </p>
                        <a
                            href="mailto:kontakt@3s-clean.de"
                            className="inline-flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] hover:bg-[var(--border)] px-5 py-3 rounded-xl transition-colors text-[var(--text)]"
                        >
                            <Mail className="w-4 h-4" />
                            <span>kontakt@3s-clean.de</span>
                        </a>
                    </div>

                    {/* WhatsApp Card */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <MessageCircle className="w-5 h-5 text-[var(--text)]" />
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text)]">
                                WhatsApp
                            </h2>
                        </div>
                        <p className="text-[var(--muted)] mb-5">
                            Fastest option for quick questions, schedule changes, or updates.
                        </p>
                        <a
                            href="https://wa.me/491762960755"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] hover:bg-[var(--border)] px-5 py-3 rounded-xl transition-colors text-[var(--text)]"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Start chat</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                </section>

                {/* Business Hours */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-[var(--text)]" />
                            <h2 className="text-lg font-semibold text-[var(--text)]">
                                Availability
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {businessHours.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-[var(--muted)]">{item.day}</span>
                                    <span className={`font-medium ${item.hours === 'Closed' ? 'text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                                        {item.hours}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Booking CTA */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 text-center">
                        <p className="text-[var(--muted)] mb-5">
                            For bookings, use our online system —
                            <br />
                            you will receive a transparent price instantly.
                        </p>
                        <Link
                            href="/booking"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                        >
                            Book a cleaning now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* Business & Partnerships */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 dark:bg-white dark:text-gray-900">
                        <h2 className="text-2xl font-bold mb-2">
                            Business & Partnerships
                        </h2>
                        <p className="opacity-70 mb-6">
                            Property management, Airbnb hosts, commercial properties, or long-term cooperation.
                        </p>
                        <a
                            href="mailto:business@3s-clean.de"
                            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-colors dark:bg-gray-900/10 dark:hover:bg-gray-900/20"
                        >
                            <Mail className="w-5 h-5" />
                            <span>business@3s-clean.de</span>
                        </a>
                    </div>
                </section>

                {/* Privacy Note */}
                <section className="px-6 py-8 max-w-4xl mx-auto text-center">
                    <p className="text-[var(--muted)] text-sm">
                        Your data is handled confidentially. No marketing. No data sharing.
                    </p>
                </section>
            </main>
            <Footer />
        </>
    );
}
