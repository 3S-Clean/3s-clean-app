"use client";

import { useBookingStore } from "@/lib/booking/store";
import { SERVICES } from "@/lib/booking/config";
import { Check } from "lucide-react";

export default function ServiceSelection() {
    const { selectedService, setSelectedService } = useBookingStore();

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Choose Your Experience</h1>
                <p className="text-gray-500">Select the cleaning service that best fits your needs</p>
            </div>

            <div className="flex flex-col gap-5">
                {SERVICES.map((service) => {
                    const isSelected = selectedService === service.id;
                    const isDark = !!service.isDark;

                    return (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService(isSelected ? null : service.id)}
                            className={`relative p-7 rounded-3xl cursor-pointer transition-all duration-300
                ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}
                ${
                                isSelected
                                    ? isDark
                                        ? "ring-4 ring-white"
                                        : "ring-4 ring-gray-900"
                                    : "hover:shadow-xl hover:-translate-y-1"
                            }`}
                        >
                            {/* CHECKMARK */}
                            {isSelected && (
                                <div
                                    className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center
                    ${isDark ? "bg-white" : "bg-gray-900"}`}
                                >
                                    <Check className={`w-5 h-5 ${isDark ? "text-gray-900" : "text-white"}`} />
                                </div>
                            )}

                            <h3 className="text-2xl font-semibold mb-3">{service.name}</h3>

                            <p className={`text-sm mb-5 leading-relaxed ${isDark ? "opacity-75" : "opacity-70"}`}>
                                {service.description}
                            </p>

                            <div
                                className={`text-lg font-semibold pb-5 mb-5 border-b ${
                                    isDark ? "border-white/20" : "border-black/10"
                                }`}
                            >
                                From € {service.startingPrice}{" "}
                                <span className={`text-sm font-normal ${isDark ? "opacity-70" : "opacity-60"}`}>
                  inc.VAT
                </span>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">Includes:</p>
                                <div className="flex flex-col gap-2">
                                    {service.includes.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm opacity-85">
                      <span
                          className={`w-1.5 h-1.5 rounded-full ${
                              isDark ? "bg-white/60" : "bg-gray-900/60"
                          }`}
                      />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}