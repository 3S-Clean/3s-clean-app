// lib/booking/useBookingNavigation.ts
"use client";

import { useMemo, useCallback } from "react";
import { useBookingStore } from "@/lib/booking/store";

const MIN_STEP = 0;
const MAX_STEP = 4;

function clampStep(n: number) {
    return Math.max(MIN_STEP, Math.min(MAX_STEP, n));
}

export function useBookingNavigation() {
    const step = useBookingStore((s) => s.step);
    const setStep = useBookingStore((s) => s.setStep);

    const postcodeVerified = useBookingStore((s) => s.postcodeVerified);
    const resetPostcodeGate = useBookingStore((s) => s.resetPostcodeGate);

    const selectedService = useBookingStore((s) => s.selectedService);
    const apartmentSize = useBookingStore((s) => s.apartmentSize);
    const peopleCount = useBookingStore((s) => s.peopleCount);

    const formData = useBookingStore((s) => s.formData);
    const selectedDate = useBookingStore((s) => s.selectedDate);
    const selectedTime = useBookingStore((s) => s.selectedTime);

    // ✅ Updated for steps:
    // 0 Service
    // 1 PLZ
    // 2 Apartment details
    // 3 Extras
    // 4 Contact & schedule
    const canContinue = useMemo(() => {
        switch (step) {
            case 0:
                return !!selectedService;

            case 1:
                return !!postcodeVerified;

            case 2:
                return !!apartmentSize && !!peopleCount;

            case 3:
                return true;

            case 4:
                return !!(
                    formData.firstName?.trim() &&
                    formData.email?.trim() &&
                    formData.phone?.trim() &&
                    formData.address?.trim() &&
                    formData.postalCode?.trim() &&
                    formData.country?.trim() &&
                    selectedDate &&
                    selectedTime
                );

            default:
                return false;
        }
    }, [
        step,
        selectedService,
        postcodeVerified,
        apartmentSize,
        peopleCount,
        formData.firstName,
        formData.email,
        formData.phone,
        formData.address,
        formData.postalCode,
        formData.country,
        selectedDate,
        selectedTime,
    ]);

    const goTo = useCallback(
        (targetStep: number) => {
            const t = clampStep(targetStep);
            if (t > step && !canContinue) return;

            setStep(t);
            if (typeof window !== "undefined") window.scrollTo(0, 0);
        },
        [step, canContinue, setStep]
    );

    const next = useCallback(() => {
        if (!canContinue) return;
        goTo(step + 1);
    }, [canContinue, goTo, step]);

    const back = useCallback(() => {
        const prev = clampStep(step - 1);

        // ✅ Important: when returning to PostcodeCheck (step 1),
        // reset PLZ + verified so it doesn't auto-skip forward.
        if (prev === 1) {
            resetPostcodeGate();
            setStep(prev);
            if (typeof window !== "undefined") window.scrollTo(0, 0);
            return;
        }

        setStep(prev);
        if (typeof window !== "undefined") window.scrollTo(0, 0);
    }, [step, setStep, resetPostcodeGate]);

    return { step, canContinue, next, back, goTo };
}