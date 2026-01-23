'use client';

import Link from 'next/link';
import { MessageCircle, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const businessHours = [
    { day: 'Mo – Fr', hours: '08:00 – 18:00' },
    { day: 'Samstag', hours: '09:00 – 14:00' },
    { day: 'Sonntag', hours: 'Geschlossen' },
];

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                        Kontakt
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Persönliche Beratung. Schnelle Antworten.
                    </p>
                </section>

                {/* Response Time Banner */}
                <section className="px-6 max-w-4xl mx-auto">
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                        <span className="text-green-600">⚡</span>
                        <p className="text-green-700">
                            Antwort in der Regel innerhalb von 2–4 Stunden
                        </p>
                    </div>
                </section>

                {/* Contact Options */}
                <section className="px-6 py-8 max-w-4xl mx-auto space-y-4">
                    {/* WhatsApp - Primary */}
                    <a
                        href="https://wa.me/491762960755"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-2xl p-5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm text-white/80">WhatsApp — Schnellste Option</p>
                                <p className="text-xl font-semibold">Chat starten</p>
                            </div>
                        </div>
                    </a>

                    {/* Phone */}
                    <a
                        href="tel:+4917629607551"
                        className="block bg-gray-100 hover:bg-gray-200 rounded-2xl p-5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Phone className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Telefon</p>
                                <p className="text-xl font-semibold text-gray-900">+49 176 2960 7551</p>
                            </div>
                        </div>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:kontakt@3s-clean.de"
                        className="block bg-gray-100 hover:bg-gray-200 rounded-2xl p-5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Mail className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">E-Mail</p>
                                <p className="text-xl font-semibold text-gray-900">kontakt@3s-clean.de</p>
                            </div>
                        </div>
                    </a>
                </section>

                {/* Business Hours */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            Erreichbarkeit
                        </h2>
                        <div className="space-y-3">
                            {businessHours.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-gray-600">{item.day}</span>
                                    <span className={`font-medium ${item.hours === 'Geschlossen' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {item.hours}
                </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Booking CTA */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-gray-50 rounded-2xl p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Für Buchungen nutzen Sie unser Online-System —
                            <br />
                            Sie erhalten sofort einen transparenten Preis.
                        </p>
                        <Link
                            href="/booking"
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
                        >
                            Jetzt Reinigung buchen
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* Business & Partnerships */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-2">Business & Partnerschaften</h2>
                        <p className="text-gray-300 mb-6">
                            Hausverwaltung, Airbnb-Hosts, Gewerbeobjekte oder langfristige Kooperationen.
                        </p>
                        <a
                            href="mailto:business@3s-clean.de"
                            className="inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-5 py-3 rounded-xl transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            <span>business@3s-clean.de</span>
                        </a>
                    </div>
                </section>

                {/* Privacy Note */}
                <section className="px-6 py-8 max-w-4xl mx-auto text-center">
                    <p className="text-gray-500 text-sm">
                        Your data is handled confidentially. No marketing messages. No data sharing.
                    </p>
                </section>
            </main>
            <Footer />
        </>

    );
}
