"use client";

import { useBookingStore } from "@/lib/booking/store";
import type { ApartmentSizeId, PeopleCountId } from "@/lib/booking/config";
import { APARTMENT_SIZES, PEOPLE_OPTIONS, FINAL_PRICES } from "@/lib/booking/config";

export default function ApartmentDetails() {
    const {
        selectedService,
        apartmentSize,
        setApartmentSize,
        peopleCount,
        setPeopleCount,
        hasPets,
        setHasPets,
        hasKids,
        setHasKids,
        hasAllergies,
        setHasAllergies,
        allergyNote,
        setAllergyNote,
    } = useBookingStore();

    // Calculate price differences for display
    const getBasePriceForSize = (sizeId: ApartmentSizeId) => {
        if (!selectedService) return 0;
        return FINAL_PRICES[sizeId][selectedService]["1-2"].noPet;
    };

    const getPriceDiffForPeople = (peopleId: PeopleCountId) => {
        if (!selectedService || !apartmentSize) return 0;
        const basePrice = FINAL_PRICES[apartmentSize][selectedService]["1-2"].noPet;
        const optionPrice = FINAL_PRICES[apartmentSize][selectedService][peopleId].noPet;
        return optionPrice - basePrice;
    };

    const getPetPriceDiff = () => {
        if (!selectedService || !apartmentSize || !peopleCount) return 0;
        const noPetPrice = FINAL_PRICES[apartmentSize][selectedService][peopleCount].noPet;
        const petPrice = FINAL_PRICES[apartmentSize][selectedService][peopleCount].pet;
        return petPrice - noPetPrice;
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Your Space</h1>
                <p className="text-gray-500">
                    Tell us about your apartment so we can provide accurate pricing
                </p>
            </div>

            {/* Apartment Size */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Apartment Size (m²)</h3>
                <div className="grid grid-cols-2 gap-3">
                    {APARTMENT_SIZES.map((size) => {
                        const isSelected = apartmentSize === size.id;
                        const price = getBasePriceForSize(size.id);

                        return (
                            <button
                                key={size.id}
                                onClick={() => setApartmentSize(size.id)}
                                className={`
                  p-5 rounded-2xl text-center transition-all duration-200 border
                  ${
                                    isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
                                }
                `}
                            >
                                <div className="text-lg font-semibold mb-1">{size.label}</div>
                                {selectedService && (
                                    <div className={`text-sm ${isSelected ? "opacity-70" : "opacity-60"}`}>
                                        from € {price.toFixed(2)}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Number of People */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Number of People Living</h3>
                <div className="grid grid-cols-3 gap-3">
                    {PEOPLE_OPTIONS.map((option) => {
                        const isSelected = peopleCount === option.id;
                        const priceDiff = getPriceDiffForPeople(option.id);

                        return (
                            <button
                                key={option.id}
                                onClick={() => setPeopleCount(option.id)}
                                className={`
                  p-4 rounded-2xl text-center transition-all duration-200 border
                  ${
                                    isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
                                }
                `}
                            >
                                <div className="text-2xl mb-1">{option.id === "1-2" ? "👤" : "👥"}</div>
                                <div className="text-base font-semibold">{option.label}</div>

                                {selectedService && apartmentSize && priceDiff > 0 && (
                                    <div className={`text-xs mt-1 ${isSelected ? "opacity-70" : "text-green-600"}`}>
                                        +€{priceDiff.toFixed(2)}
                                    </div>
                                )}

                                {selectedService && apartmentSize && priceDiff === 0 && (
                                    <div className={`text-xs mt-1 ${isSelected ? "opacity-70" : "text-gray-400"}`}>
                                        base
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Additional Information */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="flex flex-col gap-3">
                    {/* Pets */}
                    <label
                        onClick={() => setHasPets(!hasPets)}
                        className={`
              flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border
              ${hasPets ? "bg-gray-50 border-gray-900" : "bg-white border-gray-200 hover:border-gray-400"}
            `}
                    >
                        <div
                            className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center text-sm transition-all
                ${hasPets ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"}
              `}
                        >
                            {hasPets && "✓"}
                        </div>

                        <div className="flex items-center gap-2">
                            <span>🐾 I have pets</span>
                            {selectedService && apartmentSize && peopleCount && (
                                <span className="text-xs text-green-600 font-medium">
                  +€{getPetPriceDiff().toFixed(2)}
                </span>
                            )}
                        </div>
                    </label>

                    {/* Kids */}
                    <label
                        onClick={() => setHasKids(!hasKids)}
                        className={`
              flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border
              ${hasKids ? "bg-gray-50 border-gray-900" : "bg-white border-gray-200 hover:border-gray-400"}
            `}
                    >
                        <div
                            className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center text-sm transition-all
                ${hasKids ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"}
              `}
                        >
                            {hasKids && "✓"}
                        </div>
                        <span>👶 I have children</span>
                    </label>

                    {/* Allergies */}
                    <label
                        onClick={() => setHasAllergies(!hasAllergies)}
                        className={`
              flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border
              ${
                            hasAllergies
                                ? "bg-gray-50 border-gray-900"
                                : "bg-white border-gray-200 hover:border-gray-400"
                        }
            `}
                    >
                        <div
                            className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center text-sm transition-all
                ${hasAllergies ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"}
              `}
                        >
                            {hasAllergies && "✓"}
                        </div>
                        <span>⚠️ Allergies or sensitivities</span>
                    </label>

                    {/* Allergy Notes */}
                    {hasAllergies && (
                        <textarea
                            placeholder="Please describe any allergies or cleaning product sensitivities..."
                            value={allergyNote}
                            onChange={(e) => setAllergyNote(e.target.value)}
                            className="mt-2 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y min-h-[100px]"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}