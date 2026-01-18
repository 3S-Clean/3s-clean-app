"use client";

import { useBookingStore } from "@/lib/booking/store";
import { SERVICES, type Service } from "@/lib/booking/config";

export default function ServiceSelection() {
    const { selectedService, setSelectedService } = useBookingStore();

    const handleSelect = (serviceId: Service["id"]) => {
        setSelectedService(selectedService === serviceId ? null : serviceId);
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Choose Your Experience</h1>
                <p className="text-gray-500">Select the cleaning service that best fits your needs</p>
            </div>

            {/* Service Cards */}
            <div className="flex flex-col gap-5">
                {SERVICES.map((service: Service) => {
                    const isSelected = selectedService === service.id;

                    return (
                        <button
                            key={service.id}
                            type="button"
                            onClick={() => handleSelect(service.id)}
                            className={`
                relative p-7 rounded-3xl text-left transition-all duration-300
                ${service.isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}
                ${isSelected ? "ring-4 ring-green-500" : "hover:shadow-xl hover:-translate-y-1"}
              `}
                        >
                            {/* Selected Checkmark */}
                            {isSelected && (
                                <div className="absolute top-5 right-5 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                                    ✓
                                </div>
                            )}

                            {/* Service Name */}
                            <h3 className="text-2xl font-semibold mb-3">{service.name}</h3>

                            {/* Description */}
                            <p className={`text-sm mb-5 leading-relaxed ${service.isDark ? "opacity-75" : "opacity-70"}`}>
                                {service.description}
                            </p>

                            {/* Price */}
                            <div
                                className={`
                  text-lg font-semibold pb-5 mb-5 border-b
                  ${service.isDark ? "border-white/20" : "border-black/10"}
                `}
                            >
                                From € {service.startingPrice}{" "}
                                <span className={`text-sm font-normal ${service.isDark ? "opacity-70" : "opacity-60"}`}>
                  inc.VAT
                </span>
                            </div>

                            {/* Includes */}
                            <div>
                                <p className="text-sm font-semibold mb-3">Includes:</p>
                                <div className="flex flex-col gap-2">
                                    {service.includes.map((item: string, i: number) => (
                                        <div key={`${service.id}-${i}`} className="flex items-center gap-3 text-sm opacity-85">
                      <span
                          className={`w-1.5 h-1.5 rounded-full ${service.isDark ? "bg-white/60" : "bg-gray-900/60"}`}
                      />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}