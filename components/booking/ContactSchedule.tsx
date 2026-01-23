"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { SERVICES } from "@/lib/booking/config";

const optionalServices = [
    { name: "Linen change - single bed", price: "€7,50 per bed", time: "add 10 minutes per bed", frequency: "recommended every cleaning session" },
    { name: "Linen change - double bed", price: "€14 per bed", time: "add 15 minutes per bed", frequency: "recommended every cleaning session" },
    { name: "Oven heavy duty clean", price: "€100 per unit", time: "add 2 hours", frequency: "recommended once in 4-6 months" },
    { name: "Fridge heavy duty clean", price: "€50 per unit", time: "add 1 hour", frequency: "recommended once every 6 months" },
    { name: "Freezer heavy duty clean", price: "€50 per unit", time: "add 1 hour", frequency: "recommended once a year" },
    { name: "Window cleaning – inside", price: "€4,25 per m²", time: "add 15 minutes per standard window", frequency: "recommended every 4-6 months" },
    { name: "Window cleaning – outside", price: "€4,40 per m²", time: "add minutes per standard window", frequency: "recommended every 4-6 months" },
    { name: "Balcony/terrace high pressure water cleaning", price: "€5,25 per m²", time: "add 30 minutes per 5 m²", frequency: "recommended once every 6 months" },
    { name: "Intensive limescale removal", price: "€27 per half-hour block", time: "", frequency: "recommended every 4-6 months" },
    { name: "Cupboards/cabinets organization", price: "€50 per hour", time: "", frequency: "recommended once every 6 months" },
    { name: "Wardrobe arranging", price: "€50 per hour", time: "", frequency: "recommended once a month" },
    { name: "Upholstery intensive clean", price: "€6,50 per seat", time: "add 20 minutes per 3-seater sofa", frequency: "recommended every 2-3 months" },
    { name: "Glasses/plates handwash", price: "€2 per item", time: "", frequency: "" },
];

const exclusions = [
    "Moving heavy furniture or cleaning behind fixed furniture.",
    "Laundry and ironing.",
    "Carpet shampooing.",
    "Heavy renovation dirt, plaster, paint splashes.",
    "Repairs, filling holes, patch-up painting.",
    "Disposal of bulky waste.",
];

function Tooltip({ text }: { text: string }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible((v) => !v)}
                className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="More info"
            >
                <Info className="w-4 h-4" />
            </button>

            {isVisible && (
                <div className="absolute z-50 w-64 p-3 text-sm bg-white border border-gray-200 rounded-lg shadow-lg -top-2 left-6 text-gray-600">
                    {text}
                </div>
            )}
        </div>
    );
}

function ServiceCardComponent({ service }: { service: (typeof SERVICES)[number] }) {
    const baseClasses = service.isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";

    return (
        <div id={service.id} className={`rounded-3xl p-6 md:p-8 ${baseClasses}`}>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">{service.name}</h3>

            <p className={`text-sm mb-6 ${service.isDark ? "text-gray-300" : "text-gray-600"}`}>
                {service.description}
            </p>

            <p className="text-2xl font-bold mb-6">
                From € {service.startingPrice} <span className="text-sm font-normal">inc.VAT</span>
            </p>

            <Link
                href="/booking"
                className={`block w-full py-4 px-6 rounded-full text-center font-medium mb-8 transition-colors ${
                    service.isDark ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
            >
                Select Experience
            </Link>

            {service.baseFeatures ? (
                <p className={`text-sm font-medium mb-4 ${service.isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {service.baseFeatures}
                </p>
            ) : (
                <p className={`text-sm font-medium mb-4 ${service.isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Includes:
                </p>
            )}

            <ul className="space-y-3">
                {service.includes.map((feature, index) => (
                    <li key={index} className="flex items-start">
            <span
                className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0 ${
                    service.isDark ? "bg-white" : "bg-gray-900"
                }`}
                aria-hidden="true"
            />
                        <span className="flex items-center flex-wrap">
              {feature.name}
                            {feature.description ? <Tooltip text={feature.description} /> : null}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function ExperiencePage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-white mt-[80px]">
                {/* Hero */}
                <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                        3S-Clean Experiences –<br />
                        choose yours!
                    </h1>
                    <p className="text-gray-600 text-lg">Choose the type of service that fits your home.</p>
                </section>

                {/* Service Cards Grid */}
                <section className="px-6 py-8 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {SERVICES.map((service) => (
                            <ServiceCardComponent key={service.id} service={service} />
                        ))}
                    </div>
                </section>

                {/* Price Note */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    <p className="text-gray-600 text-center">
                        Final price and the expected time required are calculated based on the details you provide at time of booking and
                        the additional services you may wish to choose.
                    </p>
                </section>

                {/* Optional Services */}
                <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Optional Services</h2>
                    <p className="text-gray-600 mb-8">Available at time of booking to complement each 3S-Clean Experience:</p>

                    <div className="space-y-4">
                        {optionalServices.map((service, index) => (
                            <div
                                key={index}
                                className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100"
                            >
                                <div className="flex items-start mb-2 md:mb-0">
                                    <span className="font-medium">{service.name}</span>
                                    {service.frequency ? (
                                        <Tooltip text={`${service.time ? service.time + ", " : ""}${service.frequency}`} />
                                    ) : null}
                                </div>

                                <span className="text-gray-600 font-medium">{service.price}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Exclusions */}
                <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">What we do not do:</h2>

                    <ul className="space-y-3">
                        {exclusions.map((item, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>

            <Footer />
        </>
    );
}