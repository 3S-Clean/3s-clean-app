"use client";

import {
    SERVICES,
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    formatHours,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";

interface BookingFooterProps {
    selectedService: ServiceId | null;
    apartmentSize: ApartmentSizeId | null;
    peopleCount: PeopleCountId | null;
    hasPets: boolean;
    totalPrice: number;
    estimatedHours: number;
    canProceed: boolean;
    isLastStep: boolean;
    onBack: () => void;
    onContinue: () => void;
}

export default function BookingFooter({
                                          selectedService,
                                          apartmentSize,
                                          peopleCount,
                                          hasPets,
                                          totalPrice,
                                          estimatedHours,
                                          canProceed,
                                          isLastStep,
                                          onBack,
                                          onContinue,
                                      }: BookingFooterProps) {
    const serviceName = SERVICES.find((s) => s.id === selectedService)?.name;
    const sizeName = APARTMENT_SIZES.find((s) => s.id === apartmentSize)?.label;
    const peopleName = PEOPLE_OPTIONS.find((p) => p.id === peopleCount)?.name;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
                {/* Price Info */}
                <div>
                    {selectedService && apartmentSize && peopleCount ? (
                        <>
                            <div className="text-sm text-gray-500 mb-1">
                                {serviceName} • {sizeName}
                                {peopleCount !== "1-2" && ` • ${peopleName}`}
                                {hasPets && " • 🐾"}
                            </div>
                            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  € {totalPrice.toFixed(2)}
                </span>
                                <span className="text-sm text-gray-500">
                  inc. VAT • ~{formatHours(estimatedHours)}
                </span>
                            </div>
                        </>
                    ) : selectedService ? (
                        <div>
              <span className="text-lg font-semibold">
                From €{" "}
                  {SERVICES.find((s) => s.id === selectedService)?.startingPrice}
              </span>
                            <span className="text-sm text-gray-500 ml-2">
                Select apartment size
              </span>
                        </div>
                    ) : (
                        <div className="text-gray-400">
                            Select a service to see pricing
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-8 py-4 border border-gray-300 text-gray-900 font-medium rounded-full hover:border-gray-900 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={onContinue}
                        disabled={!canProceed}
                        className="px-8 py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                    >
                        {isLastStep ? "Confirm Booking" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}