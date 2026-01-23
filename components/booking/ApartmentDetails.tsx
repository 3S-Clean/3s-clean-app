"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
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

        const petKey = hasPets ? "pet" : "noPet";

        const base =
            FINAL_PRICES?.[apartmentSize]?.[selectedService]?.["1-2"]?.[petKey] ?? 0;

        const current =
            FINAL_PRICES?.[apartmentSize]?.[selectedService]?.[peopleId]?.[petKey] ?? 0;

        const diff = Number(current) - Number(base);
        if (!Number.isFinite(diff)) return null;

        if (diff <= 0) return "Base";
        return `+€${diff.toFixed(2)}`;
    };

    const petSurcharge = useMemo(() => {
        if (!selectedService || !apartmentSize || !peopleCount) return 0;

        const noPet =
            FINAL_PRICES?.[apartmentSize]?.[selectedService]?.[peopleCount]?.noPet ?? 0;

        const pet =
            FINAL_PRICES?.[apartmentSize]?.[selectedService]?.[peopleCount]?.pet ?? 0;

        const diff = Number(pet) - Number(noPet);
        return Number.isFinite(diff) ? diff : 0;
    }, [selectedService, apartmentSize, peopleCount]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold mb-2">Apartment Details</h1>
                <p className="text-sm text-gray-500">
                    Help us understand your space for accurate pricing
                </p>
            </div>

            {/* Apartment Size */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3">Apartment Size *</h3>

                <div className="grid grid-cols-2 gap-3">
                    {APARTMENT_SIZES.map((size) => {
                        const isSelected = apartmentSize === size.id;

                        return (
                            <button
                                key={size.id}
                                type="button"
                                onClick={() => {
                                    const nextSize = size.id;

                                    // ✅ если реально поменяли size — сбрасываем people
                                    if (apartmentSize && apartmentSize !== nextSize) {
                                        setApartmentSize(nextSize);
                                        setPeopleCount(null);
                                        return;
                                    }

                                    // ✅ первый выбор size
                                    setApartmentSize(nextSize);

                                    // ✅ если people ещё не выбран — поставим дефолт "1-2"
                                    if (!peopleCount) setPeopleCount("1-2");
                                }}
                                className={[
                                    "p-3.5 rounded-2xl text-center transition-all",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10",
                                    isSelected
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                                    "active:scale-[0.99]",
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{size.label}</div>
                            </button>
                        );
                    })}
                </div>

                {!apartmentSize && (
                    <div className="mt-3 text-xs text-gray-400">
                        Tip: choose the size that best matches your usable living area.
                    </div>
                )}
            </div>

            {/* People */}
            <div className="mb-8">
                <div className="flex items-end justify-between gap-4 mb-3">
                    <h3 className="text-base font-semibold">People Living There *</h3>
                    <div className="text-xs text-gray-400">
                        {hasPets ? "Prices shown incl. pets" : "Prices shown excl. pets"}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {PEOPLE_OPTIONS.map((opt) => {
                        const diff = getPeoplePriceDiff(opt.id);
                        const isSelected = peopleCount === opt.id;
                        const isDisabled = !apartmentSize;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setPeopleCount(opt.id)}
                                className={[
                                    "p-3.5 rounded-2xl text-center transition-all",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10",
                                    isSelected
                                        ? "bg-gray-900 text-white"
                                        : isDisabled
                                            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                                    !isDisabled ? "active:scale-[0.99]" : "",
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{opt.label}</div>

                                {diff && !isDisabled && (
                                    <div
                                        className={[
                                            "text-[11px] mt-1",
                                            isSelected
                                                ? "text-white/70"
                                                : diff === "Base"
                                                    ? "text-gray-400"
                                                    : "text-gray-900 font-medium",
                                        ].join(" ")}
                                    >
                                        {diff}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {!apartmentSize && (
                    <div className="mt-3 text-xs text-gray-400">
                        Select an apartment size first.
                    </div>
                )}
            </div>

            {/* Additional Info */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3">Additional Information</h3>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors">
                    <div>
                        <div className="font-medium text-sm">Pets at home</div>

                        {petSurcharge > 0 && (
                            <div className={hasPets ? "text-sm font-semibold text-gray-900" : "text-xs text-gray-400"}>
                                {hasPets ? `+€${petSurcharge.toFixed(2)}` : `Adds +€${petSurcharge.toFixed(2)} to the base price`}
                            </div>
                        )}
                    </div>

                    <input
                        type="checkbox"
                        checked={hasPets}
                        onChange={(e) => setHasPets(e.target.checked)}
                        className="w-6 h-6 accent-gray-900"
                    />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="font-medium text-sm">Children at home</div>
                    <input
                        type="checkbox"
                        checked={hasKids}
                        onChange={(e) => setHasKids(e.target.checked)}
                        className="w-6 h-6 accent-gray-900"
                    />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="font-medium text-sm">Allergies / sensitivities</div>
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
                        className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none text-sm"
                        rows={3}
                    />
                )}
            </div>
        </div>
    );
}