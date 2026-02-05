"use client";

import {useMemo} from "react";
import {useTranslations} from "next-intl";
import {useBookingStore} from "@/lib/booking/store";
import type {ApartmentSizeId, PeopleCountId, ServiceId} from "@/lib/booking/config";
import {APARTMENT_SIZES, FINAL_PRICES, PEOPLE_OPTIONS} from "@/lib/booking/config";
import {isApartmentSizeId, isPeopleCountId, isServiceId} from "@/lib/booking/guards";
import {AUTH_CARD_BASE, CARD_FRAME_ACTION} from "@/components/ui/card/CardFrame";

// ✅ Selected state: border only (no fill)
// light: dark ring
// dark: light ring
const SELECTED_CARD = [
    "border-2 border-gray-900/35",
    "dark:border-white/35",
].join(" ");

// ✅ Selected: same base + stronger border (no fill)
const SELECTED_CARD_CLASS = [CARD_FRAME_ACTION, SELECTED_CARD].join(" ");

// ✅ Base (not selected): use our standard clickable card base
const BASE_CARD = CARD_FRAME_ACTION;

// ✅ For checkbox rows (pets/kids/allergies) we want clickable card feel too
const ROW_CARD_BASE = [
    CARD_FRAME_ACTION,
    "p-4 rounded-2xl",
    "flex items-center justify-between",
].join(" ");

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
                <h1 className="text-2xl font-semibold mb-2 text-[var(--text)]">{t("title")}</h1>
                <p className="text-sm text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            {/* Apartment Size */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-[var(--text)]">{t("size.title")}</h3>

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
                                    "p-3.5 rounded-2xl text-center",
                                    isSelected ? SELECTED_CARD_CLASS : BASE_CARD,
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{size.label}</div>
                            </button>
                        );
                    })}
                </div>

                {!sizeId && <div className="mt-3 text-xs text-[var(--muted)]">{t("size.tip")}</div>}
            </div>

            {/* People */}
            <div className="mb-8">
                <div className="flex items-end justify-between gap-4 mb-3">
                    <h3 className="text-base font-semibold text-[var(--text)]">{t("people.title")}</h3>
                    <div className="text-xs text-[var(--muted)]">
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
                                    "p-3.5 rounded-2xl text-center",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                                    isDisabled ? "opacity-40 cursor-not-allowed" : "",
                                    isSelected ? SELECTED_CARD_CLASS : BASE_CARD,
                                ].join(" ")}
                            >
                                <div className="text-base font-semibold">{opt.label}</div>

                                {diff && !isDisabled && (
                                    <div
                                        className={[
                                            "text-[11px] mt-1",
                                            isSelected
                                                ? "text-[var(--muted)]"
                                                : diff === t("people.base")
                                                    ? "text-[var(--muted)]"
                                                    : "text-[color:var(--text)] font-medium",
                                        ].join(" ")}
                                    >
                                        {diff}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {!sizeId && <div className="mt-3 text-xs text-[var(--muted)]">{t("people.pickSizeFirst")}</div>}
            </div>

            {/* Additional Info */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-[var(--text)]">{t("additional.title")}</h3>

                {/* Pets */}
                <label className={[ROW_CARD_BASE, "mb-3"].join(" ")}>
                    <div className="text-left">
                        <div className="font-medium text-sm text-[var(--text)]">{t("additional.pets")}</div>

                        {petSurcharge > 0 && (
                            <div
                                className={
                                    hasPets
                                        ? "text-sm font-semibold text-[var(--text)]"
                                        : "text-xs text-[var(--muted)]"
                                }
                            >
                                {hasPets ? `+€${petSurcharge.toFixed(2)}` : t("additional.petsAdds", {price: petSurcharge.toFixed(2)})}
                            </div>
                        )}
                    </div>

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
                                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                                    : "bg-transparent border-black/15 text-transparent dark:border-white/20 dark:text-transparent",
                            ].join(" ")}
                            aria-hidden="true"
                        >
                            {hasPets ? <CheckIcon/> : null}
                        </span>
                    </span>
                </label>

                {/* Kids */}
                <label className={[ROW_CARD_BASE, "mb-3"].join(" ")}>
                    <div className="font-medium text-sm text-[var(--text)] text-left">{t("additional.kids")}</div>

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
                                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                                    : "bg-transparent border-black/15 text-transparent dark:border-white/20 dark:text-transparent",
                            ].join(" ")}
                            aria-hidden="true"
                        >
                            {hasKids ? <CheckIcon/> : null}
                        </span>
                    </span>
                </label>

                {/* Allergies */}
                <label className={ROW_CARD_BASE}>
                    <div className="font-medium text-sm text-[var(--text)] text-left">{t("additional.allergies")}</div>

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
                                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                                    : "bg-transparent border-black/15 text-transparent dark:border-white/20 dark:text-transparent",
                            ].join(" ")}
                            aria-hidden="true"
                        >
                            {hasAllergies ? <CheckIcon/> : null}
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
                            // ✅ same input feel as our auth/inputs, but keep textarea compact
                            AUTH_CARD_BASE,
                            "bg-transparent",
                            "placeholder:text-[color:var(--muted)]/70",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                        ].join(" ")}
                        rows={3}
                    />
                )}
            </div>
        </div>
    );
}