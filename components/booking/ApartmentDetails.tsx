"use client";

import {
    APARTMENT_SIZES,
    PEOPLE_OPTIONS,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";
import { useBookingStore } from "@/lib/booking/store";

export default function ApartmentDetails() {
    const {
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
        nextStep,
        prevStep,
    } = useBookingStore();

    const canNext = Boolean(apartmentSize && peopleCount);

    const pill = (active: boolean) =>
        [
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            active
                ? "border-black bg-black text-white"
                : "border-black/15 bg-white text-black hover:bg-black/5",
        ].join(" ");

    return (
        <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight text-black">
                Apartment details
            </h2>
            <p className="mt-2 text-sm text-black/55">
                Select size and people count.
            </p>

            <div className="mt-6 rounded-[24px] border border-black/10 bg-white/60 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                <div className="text-sm font-semibold text-black">Size</div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {APARTMENT_SIZES.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setApartmentSize(s.id as ApartmentSizeId)}
                            className={pill(apartmentSize === s.id)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6 text-sm font-semibold text-black">People</div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {PEOPLE_OPTIONS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPeopleCount(p.id as PeopleCountId)}
                            className={pill(peopleCount === p.id)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6 grid gap-3">
                    <label className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white/70 px-4 py-3">
                        <span className="text-sm text-black/70">Pets</span>
                        <input
                            type="checkbox"
                            checked={hasPets}
                            onChange={(e) => setHasPets(e.target.checked)}
                            className="h-5 w-5 accent-black"
                        />
                    </label>

                    <label className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white/70 px-4 py-3">
                        <span className="text-sm text-black/70">Kids</span>
                        <input
                            type="checkbox"
                            checked={hasKids}
                            onChange={(e) => setHasKids(e.target.checked)}
                            className="h-5 w-5 accent-black"
                        />
                    </label>

                    <label className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white/70 px-4 py-3">
                        <span className="text-sm text-black/70">Allergies</span>
                        <input
                            type="checkbox"
                            checked={hasAllergies}
                            onChange={(e) => setHasAllergies(e.target.checked)}
                            className="h-5 w-5 accent-black"
                        />
                    </label>

                    {hasAllergies && (
                        <textarea
                            value={allergyNote}
                            onChange={(e) => setAllergyNote(e.target.value)}
                            placeholder="Allergy notes (optional)"
                            className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                            rows={3}
                        />
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={prevStep}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black hover:bg-black/5"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={!canNext}
                        className="w-full rounded-full border border-black/15 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-40"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </section>
    );
}