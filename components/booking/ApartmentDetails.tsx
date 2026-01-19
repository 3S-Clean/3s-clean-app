"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store"; // <-- если у тебя стор так называется
// если стор у тебя в /lib/booking/store.ts, верни старый импорт

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

    const getPeoplePriceDiff = (peopleId: string) => {
        if (!selectedService || !apartmentSize) return null;

        const sizeKey = apartmentSize as string;
        const serviceKey = selectedService as string;

        const base = FINAL_PRICES?.[sizeKey]?.[serviceKey]?.["1-2"]?.noPet ?? 0;
        const current = FINAL_PRICES?.[sizeKey]?.[serviceKey]?.[peopleId]?.noPet ?? 0;

        const diff = Number(current) - Number(base);
        if (!Number.isFinite(diff)) return null;

        return diff > 0 ? `+€${diff.toFixed(2)}` : "base";
    };

    const petSurcharge = useMemo(() => {
        if (!selectedService || !apartmentSize || !peopleCount) return 0;

        const sizeKey = apartmentSize as string;
        const serviceKey = selectedService as string;
        const peopleKey = peopleCount as string;

        const noPet = FINAL_PRICES?.[sizeKey]?.[serviceKey]?.[peopleKey]?.noPet ?? 0;
        const pet = FINAL_PRICES?.[sizeKey]?.[serviceKey]?.[peopleKey]?.pet ?? 0;

        const diff = Number(pet) - Number(noPet);
        return Number.isFinite(diff) ? diff : 0;
    }, [selectedService, apartmentSize, peopleCount]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Apartment Details</h1>
                <p className="text-gray-500">Help us understand your space for accurate pricing</p>
            </div>

            {/* Apartment Size */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Apartment Size *</h3>
                <div className="grid grid-cols-2 gap-3">
                    {APARTMENT_SIZES.map((size) => (
                        <button
                            key={size.id}
                            type="button"
                            onClick={() => setApartmentSize(size.id)}
                            className={`p-4 rounded-2xl text-center transition-all ${
                                apartmentSize === size.id
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <div className="text-xl font-semibold">{size.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* People */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">People Living There *</h3>
                <div className="grid grid-cols-3 gap-3">
                    {PEOPLE_OPTIONS.map((opt) => {
                        const diff = getPeoplePriceDiff(opt.id);
                        const isSelected = peopleCount === opt.id;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setPeopleCount(opt.id)}
                                className={`p-4 rounded-2xl text-center transition-all ${
                                    isSelected
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="text-xl font-semibold">{opt.label}</div>

                                {diff && (
                                    <div className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-gray-900 font-medium"}`}>
                                        {diff}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Additional Info */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

                {/* Pets */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🐾</span>
                        <div>
                            <div className="font-medium">Pets at home</div>
                            {petSurcharge > 0 && (
                                <div className="text-sm text-gray-900 font-medium">+€{petSurcharge.toFixed(2)}</div>
                            )}
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={hasPets}
                        onChange={(e) => setHasPets(e.target.checked)}
                        className="w-6 h-6 accent-gray-900"
                    />
                </label>

                {/* Kids */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">👶</span>
                        <div className="font-medium">Children at home</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={hasKids}
                        onChange={(e) => setHasKids(e.target.checked)}
                        className="w-6 h-6 accent-gray-900"
                    />
                </label>

                {/* Allergies */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌿</span>
                        <div className="font-medium">Allergies / sensitivities</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={hasAllergies}
                        onChange={(e) => setHasAllergies(e.target.checked)}
                        className="w-6 h-6 accent-gray-900"
                    />
                </label>

                {hasAllergies && (
                    <textarea
                        value={allergyNote}
                        onChange={(e) => setAllergyNote(e.target.value)}
                        placeholder="Please describe any allergies..."
                        className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                        rows={3}
                    />
                )}
            </div>
        </div>
    );
}