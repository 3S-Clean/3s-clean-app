// lib/booking/useBookingNavigation.ts
"use client";

import { useMemo } from "react";
import { useBookingStore } from "@/lib/booking/store";

export type BookingStep = 0 | 1 | 2 | 3 | 4;
const MIN_STEP: BookingStep = 0;
const MAX_STEP: BookingStep = 4;

function clampStep(n: number): BookingStep {
    const x = Math.max(MIN_STEP, Math.min(MAX_STEP, n));
    return x as BookingStep;
}

export function useBookingNavigation() {
    const {
        step,
        setStep,

        postcodeVerified,
        setPostcodeVerified,

        selectedService,
        apartmentSize,
        peopleCount,

        formData,
        selectedDate,
        selectedTime,
    } = useBookingStore();

    const canContinue = useMemo(() => {
        if (step === 0) return !!postcodeVerified;

        if (step === 1) return !!selectedService;

        if (step === 2) return !!apartmentSize && !!peopleCount;

        if (step === 3) return true;

        if (step === 4) {
            return Boolean(
                formData.firstName?.trim() &&
                formData.lastName?.trim() &&
                formData.email?.trim() &&
                formData.phone?.trim() &&
                formData.address?.trim() &&
                formData.postalCode?.trim() &&
                formData.city?.trim() &&
                formData.country?.trim() &&
                selectedDate &&
                selectedTime
            );
        }

        return false;
    }, [
        step,
        postcodeVerified,
        selectedService,
        apartmentSize,
        peopleCount,
        formData,
        selectedDate,
        selectedTime,
    ]);

    const goto = (target: number) => {
        const next = clampStep(target);

        // 🔒 guard: нельзя перепрыгнуть вперёд, если нет условий
        if (next > step && !canContinue) return;

        // 🔒 guard: шаги выше 0 требуют verified
        if (next > 0 && !postcodeVerified) return;

        setStep(next);
    };

    const next = () => {
        if (!canContinue) return;
        goto(step + 1);
    };

    const back = () => {
        // ⬅️ ВАЖНО: step=1 -> вернуться на PLZ (step 0) и сбросить verified
        if (step === 1) {
            setPostcodeVerified(false);
            setStep(0);
            return;
        }
        goto(step - 1);
    };

    const resetToStart = () => {
        setPostcodeVerified(false);
        setStep(0);
    };

    return {
        step,
        canContinue,
        next,
        back,
        goto,
        resetToStart,
    };
}