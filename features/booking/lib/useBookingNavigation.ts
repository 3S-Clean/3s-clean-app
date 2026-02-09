"use client";

import {useMemo, useCallback} from "react";
import {useBookingStore} from "@/features/booking/lib/store";

const MIN_STEP = 0;
const MAX_STEP = 4;

const clampStep = (n: number) => Math.max(MIN_STEP, Math.min(MAX_STEP, n));

export function useBookingNavigation() {
    const step = useBookingStore((s) => s.step);
    const setStep = useBookingStore((s) => s.setStep);

    const postcodeVerified = useBookingStore((s) => s.postcodeVerified);
    const setPostcodeVerified = useBookingStore((s) => s.setPostcodeVerified);

    const selectedService = useBookingStore((s) => s.selectedService);
    const apartmentSize = useBookingStore((s) => s.apartmentSize);
    const peopleCount = useBookingStore((s) => s.peopleCount);

    const formData = useBookingStore((s) => s.formData);
    const selectedDate = useBookingStore((s) => s.selectedDate);
    const selectedTime = useBookingStore((s) => s.selectedTime);

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

    const scrollTop = () => {
        if (typeof window !== "undefined") window.scrollTo({top: 0, left: 0, behavior: "smooth"});
    };

    const goTo = useCallback(
        (target: number) => {
            const t = clampStep(target);
            // не даём прыгать вперёд если нельзя
            if (t > step && !canContinue) return;
            setStep(t);
            scrollTop();
        },
        [step, canContinue, setStep]
    );

    const next = useCallback(() => {
        if (!canContinue) return;
        goTo(step + 1);
    }, [canContinue, goTo, step]);

    const back = useCallback(() => {
        const prev = clampStep(step - 1);

        // если возвращаемся на PLZ — сбрасываем verified
        if (prev === 1) {
            setPostcodeVerified(false);
            setStep(1);
            scrollTop();
            return;
        }

        setStep(prev);
        scrollTop();
    }, [step, setStep, setPostcodeVerified]);

    return {step, canContinue, next, back, goTo};
}