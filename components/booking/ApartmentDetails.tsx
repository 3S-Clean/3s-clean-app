"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/lib/booking/store";
import { APARTMENT_SIZES, PEOPLE_OPTIONS, FINAL_PRICES } from "@/lib/booking/config";
import type { ApartmentSizeId, PeopleCountId, ServiceId } from "@/lib/booking/config";
import { isApartmentSizeId, isPeopleCountId, isServiceId } from "@/lib/booking/guards";

// ✅ Selected: light = dark (not pure black), dark = white
const SELECTED_CARD =
    "bg-gray-800 text-white border border-black/10 hover:bg-gray-700 " +
    "dark:bg-white dark:text-gray-900 dark:border-black/10 dark:hover:bg-white/90";

// ✅ Base: keep as before (light white, dark translucent)
const BASE_CARD =
    "bg-white text-gray-900 border border-black/10 hover:bg-black/[0.03] " +
    "dark:bg-white/[0.06] dark:text-white dark:border-white/10 dark:hover:bg-white/[0.10]";

function CheckIcon() {
    return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
            <path
                d="M16.7 5.7 8.1 14.3 3.3 9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ApartmentDetails() {
    const t = useTranslations("bookingDetails");

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

    /** ✅ normalize store values -> strong ids (fixes TS7053 indexing) */
    const serviceId: ServiceId | null = isServiceId(String(selectedService ?? ""))
        ? (selectedService as ServiceId)
        : null;
    const sizeId: ApartmentSizeId | null = isApartmentSizeId(String(apartmentSize ?? ""))
        ? (apartmentSize as ApartmentSizeId)
        : null;
    const peopleId: PeopleCountId | null = isPeopleCountId(String(peopleCount ?? ""))
        ? (peopleCount as PeopleCountId)
        : null;

    const getPeoplePriceDiff = (pid: PeopleCountId) => {
        if (!serviceId || !sizeId) return null;

        const petKey = hasPets ? "pet" : "noPet";

        const base = FINAL_PRICES?.[sizeId]?.[serviceId]?.["1-2"]?.[petKey] ?? 0;
        const current = FINAL_PRICES?.[sizeId]?.[serviceId]?.[pid]?.[petKey] ?? 0;

        const diff = Number(current) - Number(base);
        if (!Number.isFinite(diff)) return null;

        if (diff <= 0) return t("people.base");
        return `+€${diff.toFixed(2)}`;
    };

    const petSurcharge = useMemo(() => {
        if (!serviceId || !sizeId || !peopleId) return 0;

        const noPet = FINAL_PRICES?.[sizeId]?.[serviceId]?.[peopleId]?.noPet ?? 0;
        const pet = FINAL_PRICES?.[sizeId]?.[serviceId]?.[peopleId]?.pet ?? 0;

        const diff = Number(pet) - Number(noPet);
        return Number.isFinite(diff) ? diff : 0;
    }, [serviceId, sizeId, peopleId]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{t("title")}</h1>
                <p className="text-sm text-gray-600 dark:text-white/60">{t("subtitle")}</p>
            </div>

            {/* Apartment Size */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t("size.title")}</h3>

                <div className="grid grid-cols-2 gap-3">
                    {APARTMENT_SIZES.map((size) => {
                        const isSelected = sizeId === size.id;

                        return (
                            <button
                                key={size.id}
                                type="button"
                                onClick={() => {
                                    const nextSize = size.id;

                                    // ✅ if size changed -> reset people
                                    if (sizeId && sizeId !== nextSize) {
                                        setApartmentSize(nextSize);
                                        setPeopleCount(null);
                                        return;
                                    }

                                    setApartmentSize(nextSize);
                                    if (!peopleCount) setPeopleCount("1-2");
                                }}
                                className={[
                                    "p-3.5 rounded-2xl text-center transition-all",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                                    // ✅ IMPORTANT: either base OR selected (no mixing)
                                    isSelected ? SELECTED_CARD : BASE_CARD,
                                    "active:scale-[0.99]",
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{size.label}</div>
                            </button>
                        );
                    })}
                </div>

                {!sizeId && <div className="mt-3 text-xs text-gray-500 dark:text-white/50">{t("size.tip")}</div>}
            </div>

            {/* People */}
            <div className="mb-8">
                <div className="flex items-end justify-between gap-4 mb-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("people.title")}</h3>
                    <div className="text-xs text-gray-600 dark:text-white/55">
                        {hasPets ? t("people.pricesInclPets") : t("people.pricesExclPets")}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {PEOPLE_OPTIONS.map((opt) => {
                        const optId = isPeopleCountId(opt.id) ? (opt.id as PeopleCountId) : null;
                        const diff = optId ? getPeoplePriceDiff(optId) : null;
                        const isSelected = peopleId === opt.id;
                        const isDisabled = !sizeId;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setPeopleCount(opt.id)}
                                className={[
                                    "p-3.5 rounded-2xl text-center transition-all",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                                    isDisabled ? "opacity-40 cursor-not-allowed" : "",
                                    // ✅ either base OR selected
                                    isSelected ? SELECTED_CARD : BASE_CARD,
                                    !isDisabled ? "active:scale-[0.99]" : "",
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{opt.label}</div>

                                {diff && !isDisabled && (
                                    <div
                                        className={[
                                            "text-[11px] mt-1",
                                            // ✅ selected: light on dark bg; dark on white bg
                                            isSelected
                                                ? "text-white/75 dark:text-gray-600"
                                                : diff === t("people.base")
                                                    ? "text-gray-600 dark:text-white/55"
                                                    : "text-gray-900 dark:text-white font-medium",
                                        ].join(" ")}
                                    >
                                        {diff}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {!sizeId && <div className="mt-3 text-xs text-gray-500 dark:text-white/50">{t("people.pickSizeFirst")}</div>}
            </div>

            {/* Additional Info */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{t("additional.title")}</h3>

                {/* Pets */}
                <label
                    className={[
                        "flex items-center justify-between p-4 rounded-2xl mb-3 cursor-pointer transition-colors",
                        "bg-white border border-black/10 hover:ring-1 hover:ring-black/10",
                        "dark:bg-white/[0.06] dark:border-white/10 dark:hover:ring-white/10",
                    ].join(" ")}
                >
                    <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{t("additional.pets")}</div>

                        {petSurcharge > 0 && (
                            <div
                                className={
                                    hasPets
                                        ? "text-sm font-semibold text-gray-900 dark:text-white"
                                        : "text-xs text-gray-600 dark:text-white/55"
                                }
                            >
                                {hasPets ? `+€${petSurcharge.toFixed(2)}` : t("additional.petsAdds", { price: petSurcharge.toFixed(2) })}
                            </div>
                        )}
                    </div>

                    {/* ✅ round checkbox + correct check colors */}
                    <span className="relative">
            <input
                type="checkbox"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="sr-only"
            />
            <span
                className={[
                    "grid place-items-center w-6 h-6 rounded-full border transition",
                    hasPets
                        ? "bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                        : "bg-white border-black/15 text-transparent dark:bg-white/[0.06] dark:border-white/20 dark:text-transparent",
                ].join(" ")}
                aria-hidden="true"
            >
              {hasPets ? <CheckIcon /> : null}
            </span>
          </span>
                </label>

                {/* Kids */}
                <label
                    className={[
                        "flex items-center justify-between p-4 rounded-2xl mb-3 cursor-pointer transition-colors",
                        "bg-white border border-black/10 hover:ring-1 hover:ring-black/10",
                        "dark:bg-white/[0.06] dark:border-white/10 dark:hover:ring-white/10",
                    ].join(" ")}
                >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t("additional.kids")}</div>

                    <span className="relative">
            <input
                type="checkbox"
                checked={hasKids}
                onChange={(e) => setHasKids(e.target.checked)}
                className="sr-only"
            />
            <span
                className={[
                    "grid place-items-center w-6 h-6 rounded-full border transition",
                    hasKids
                        ? "bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                        : "bg-white border-black/15 text-transparent dark:bg-white/[0.06] dark:border-white/20 dark:text-transparent",
                ].join(" ")}
                aria-hidden="true"
            >
              {hasKids ? <CheckIcon /> : null}
            </span>
          </span>
                </label>

                {/* Allergies */}
                <label
                    className={[
                        "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors",
                        "bg-white border border-black/10 hover:ring-1 hover:ring-black/10",
                        "dark:bg-white/[0.06] dark:border-white/10 dark:hover:ring-white/10",
                    ].join(" ")}
                >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t("additional.allergies")}</div>

                    <span className="relative">
            <input
                type="checkbox"
                checked={hasAllergies}
                onChange={(e) => setHasAllergies(e.target.checked)}
                className="sr-only"
            />
            <span
                className={[
                    "grid place-items-center w-6 h-6 rounded-full border transition",
                    hasAllergies
                        ? "bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                        : "bg-white border-black/15 text-transparent dark:bg-white/[0.06] dark:border-white/20 dark:text-transparent",
                ].join(" ")}
                aria-hidden="true"
            >
              {hasAllergies ? <CheckIcon /> : null}
            </span>
          </span>
                </label>

                {hasAllergies && (
                    <textarea
                        value={allergyNote}
                        onChange={(e) => setAllergyNote(e.target.value)}
                        placeholder={t("additional.allergiesPlaceholder")}
                        className={[
                            "w-full mt-3 px-4 py-3 rounded-xl resize-none text-sm outline-none transition",
                            // light
                            "bg-white border border-black/10 text-gray-900 placeholder:text-gray-500/70",
                            // dark
                            "dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:placeholder:text-white/40",
                            "focus:ring-2 focus:ring-[var(--ring)]",
                        ].join(" ")}
                        rows={3}
                    />
                )}
            </div>
        </div>
    );
}