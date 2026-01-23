'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Video, Users, Leaf, Award, Heart } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const values = [
    {
        icon: Shield,
        title: 'Vertrauen durch Transparenz',
        description: 'Live-Video-Streaming jeder Reinigung. Sie sehen genau, was passiert – auch wenn Sie nicht zu Hause sind.',
    },
    {
        icon: Users,
        title: 'Festangestellte Mitarbeiter',
        description: 'Keine Freelancer. Alle unsere Reinigungskräfte sind bei uns angestellt, geschult und versichert.',
    },
    {
        icon: Leaf,
        title: 'Umweltfreundlich',
        description: 'Wir verwenden ausschließlich ökologische Reinigungsprodukte, die gut für Ihr Zuhause und die Umwelt sind.',
    },
    {
        icon: Award,
        title: 'Qualitätsgarantie',
        description: 'Regelmäßige Video-Reviews und Schulungen sorgen für konstant hohe Qualität bei jeder Reinigung.',
    },
];

const stats = [
    { value: '7', label: 'Tage Video-Zugriff' },
    { value: '20%', label: 'Steuerersparnis möglich' },
    { value: '48h', label: 'Rechnung nach Reinigung' },
    { value: '100%', label: 'Haftpflichtversichert' },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-16 max-w-4xl mx-auto text-center">
                    <p className="text-sm font-medium text-gray-500 mb-4 tracking-wider uppercase">
                        Inside 3S
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        Reinigung neu gedacht
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                        Wir haben 3S-Clean gegründet, weil wir glauben, dass professionelle Reinigung transparent, zuverlässig und fair sein sollte.
                    </p>
                </section>

                {/* Mission Statement */}
                <section className="px-6 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Unsere Mission</h2>
                        <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                            <p>
                                Einen Fremden in Ihr Zuhause zu lassen erfordert Vertrauen. Dieses Vertrauen muss verdient werden – durch <strong className="text-white">Transparenz, Professionalität und konstante Qualität</strong>.
                            </p>
                            <p>
                                Deshalb haben wir das Konzept der Video-Dokumentation eingeführt: Sie können jeden Reinigungsvorgang live verfolgen oder nachträglich anschauen. Keine versteckten Überraschungen, keine Unsicherheiten.
                            </p>
                            <p>
                                <strong className="text-white">3S steht für: Sauber. Sicher. Souverän.</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Was uns ausmacht
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl p-6 md:p-8"
                            >
                                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                                    <value.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="px-6 py-12 md:py-20 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                                        {stat.value}
                                    </p>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Unser Team</h2>
                        <p className="text-gray-600 text-lg">
                            Hinter 3S-Clean stehen Menschen, die Reinigung als Handwerk verstehen.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Mitarbeiter, die ihren Job lieben</h3>
                                <p className="text-gray-600">
                                    Wir stellen nur Menschen ein, die Freude am Reinigen haben und Stolz auf ihre Arbeit sind. Jeder Mitarbeiter durchläuft ein intensives Training und wird kontinuierlich geschult.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Qualität wird überwacht</h3>
                                <p className="text-gray-600">
                                    Wir reviewen regelmäßig Video-Aufnahmen, um sicherzustellen, dass unsere Standards eingehalten werden. Feedback fließt direkt in Schulungen ein.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Vollständig versichert</h3>
                                <p className="text-gray-600">
                                    Alle Mitarbeiter sind haftpflichtversichert. Falls jemals etwas schief geht, sind Sie abgesichert – ohne Diskussion.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stuttgart Section */}
                <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
                    <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Stuttgarts Premium-Reinigung</h2>
                        <p className="text-gray-300 text-lg mb-6">
                            Wir sind stolz darauf, Haushalte im Großraum Stuttgart zu betreuen. Von der Innenstadt bis zu den Vororten – wir bringen Premium-Reinigung zu Ihnen nach Hause.
                        </p>
                        <p className="text-gray-300">
                            Unser Servicegebiet umfasst Stuttgart und die umliegenden Gemeinden. Nicht sicher, ob wir zu Ihnen kommen? Geben Sie Ihre Postleitzahl bei der Buchung ein.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Bereit für echte Transparenz?
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Erleben Sie, wie professionelle Reinigung sein sollte.
                    </p>
                    <Link
                        href="/booking"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        Jetzt buchen
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </main>
            <Footer />
        </>

    );
}
