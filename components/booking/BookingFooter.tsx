"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";
import {
    calculateHours,
    calculatePrice,
    formatHours,
    type ServiceId,
    type ApartmentSizeId,
    type PeopleCountId,
} from "@/lib/booking/config";

export default function BookingFooter({
                                          onBack,
                                          onNext,
                                          nextDisabled,
                                          nextLabel = "Continue",
                                          backLabel = "Back",
                                      }: {
    onBack?: () => void;
    onNext?: () => void;
    nextDisabled?: boolean;
    nextLabel?: string;
    backLabel?: string;
}) {
    const { selectedService, apartmentSize, peopleCount, hasPets, extras } = useBookingStore();

    const { totalPrice, hours } = useMemo(() => {
        if (!selectedService || !apartmentSize || !peopleCount) return { totalPrice: 0, hours: 0 };

        const p = calculatePrice(
            selectedService as ServiceId,
            apartmentSize as ApartmentSizeId,
            peopleCount as PeopleCountId,
            hasPets,
            extras
        );

        const h = calculateHours(selectedService as ServiceId, apartmentSize as ApartmentSizeId, extras);

        return { totalPrice: p.totalPrice, hours: h };
    }, [selectedService, apartmentSize, peopleCount, hasPets, extras]);

    return (
        <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-2xl px-4 py-4">
                <div className="rounded-[20px] border border-black/10 bg-white/60 px-4 py-3">
                    <div className="text-xl font-semibold tracking-tight text-black">€ {totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-black/55">
                        inc. VAT <span className="text-black/45">• ~{formatHours(hours)}</span>
                    </div>
                </div>

                <div className="mt-3 flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={!onBack}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black hover:bg-black/5 disabled:opacity-40"
                    >
                        {backLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={nextDisabled || !onNext}
                        className="w-full rounded-full border border-black/15 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-40"
                    >
                        {nextLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}