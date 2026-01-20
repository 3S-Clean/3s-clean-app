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
    const postcodeVerified = useBookingStore((s) => s.postcodeVerified);
    const setPostcodeVerified = useBookingStore((s) => s.setPostcodeVerified);
    const setStep = useBookingStore((s) => s.setStep);
    const selectedService = useBookingStore((s) => s.selectedService);
    const apartmentSize = useBookingStore((s) => s.apartmentSize);
    const peopleCount = useBookingStore((s) => s.peopleCount);
    const formData = useBookingStore((s) => s.formData);
    const selectedDate = useBookingStore((s) => s.selectedDate);
    const selectedTime = useBookingStore((s) => s.selectedTime);

    // ✅ единственная логика допуска перехода
    const canContinue = useMemo(() => {
        switch (step) {
            case 0:
                return !!postcodeVerified;
            case 1:
                return !!selectedService;
            case 2:
                return !!apartmentSize && !!peopleCount;
            case 3:
                return true;
            case 4:
                return !!(
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
            default:
                return false;
        }
    }, [
        step,
        postcodeVerified,
        selectedService,
        apartmentSize,
        peopleCount,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.address,
        formData.postalCode,
        formData.city,
        formData.country,
        selectedDate,
        selectedTime,
    ]);

    const goTo = useCallback(
        (targetStep: number) => {
            const t = clampStep(targetStep);

            // 🔒 guard: нельзя прыгнуть вперёд, если текущий step не валиден
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

        // ✅ Ключевой фикс: когда возвращаемся на PLZ (1 -> 0),
        // обязаны сбросить verified, иначе тебя тут же снова перекинет вперед.
        if (step === 1 && prev === 0) {
            setPostcodeVerified(false);
        }

        setStep(prev);
        if (typeof window !== "undefined") window.scrollTo(0, 0);
    }, [step, setStep, setPostcodeVerified]);

    return {
        step,
        canContinue,
        next,
        back,
        goTo,
    };
}