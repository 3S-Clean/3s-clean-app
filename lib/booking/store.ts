// lib/booking-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
}

interface BookingState {
    step: number;
    setStep: (step: number) => void;

    nextStep: () => void;
    prevStep: () => void;

    postcode: string;
    setPostcode: (postcode: string) => void;

    postcodeVerified: boolean;
    setPostcodeVerified: (verified: boolean) => void;

    selectedService: string | null;
    setSelectedService: (service: string | null) => void;

    apartmentSize: string | null;
    setApartmentSize: (size: string | null) => void;

    peopleCount: string | null;
    setPeopleCount: (count: string | null) => void;

    hasPets: boolean;
    setHasPets: (hasPets: boolean) => void;

    hasKids: boolean;
    setHasKids: (hasKids: boolean) => void;

    hasAllergies: boolean;
    setHasAllergies: (hasAllergies: boolean) => void;

    allergyNote: string;
    setAllergyNote: (note: string) => void;

    extras: Record<string, number>;
    setExtras: (extras: Record<string, number>) => void;
    updateExtra: (extraId: string, delta: number) => void;

    formData: FormData;
    setFormData: (data: Partial<FormData>) => void;

    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;

    selectedTime: string | null;
    setSelectedTime: (time: string | null) => void;

    pendingToken: string | null;
    setPendingToken: (token: string | null) => void;

    resetBooking: () => void;
}

const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
};

const initialState = {
    step: 0,
    postcode: "",
    postcodeVerified: false,

    selectedService: null as string | null,
    apartmentSize: null as string | null,
    peopleCount: null as string | null,

    hasPets: false,
    hasKids: false,
    hasAllergies: false,
    allergyNote: "",

    extras: {} as Record<string, number>,

    formData: initialFormData,

    selectedDate: null as string | null,
    selectedTime: null as string | null,

    pendingToken: null as string | null,
};

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setStep: (step) => set({ step }),
            nextStep: () => set({ step: get().step + 1 }),
            prevStep: () => set({ step: Math.max(0, get().step - 1) }),

            setPostcode: (postcode) => set({ postcode }),
            setPostcodeVerified: (postcodeVerified) => set({ postcodeVerified }),

            setSelectedService: (selectedService) => set({ selectedService }),
            setApartmentSize: (apartmentSize) => set({ apartmentSize }),
            setPeopleCount: (peopleCount) => set({ peopleCount }),

            setHasPets: (hasPets) => set({ hasPets }),
            setHasKids: (hasKids) => set({ hasKids }),
            setHasAllergies: (hasAllergies) => set({ hasAllergies }),
            setAllergyNote: (allergyNote) => set({ allergyNote }),

            setExtras: (extras) => set({ extras }),

            updateExtra: (extraId, delta) =>
                set((state) => {
                    const current = state.extras[extraId] || 0;
                    const next = Math.max(0, current + delta);

                    // ✅ если стало 0 — удаляем ключ (чище JSON)
                    const extras = { ...state.extras };
                    if (next === 0) delete extras[extraId];
                    else extras[extraId] = next;

                    return { extras };
                }),

            formData: initialFormData,
            setFormData: (data) =>
                set((state) => ({ formData: { ...state.formData, ...data } })),

            setSelectedDate: (selectedDate) => set({ selectedDate }),
            setSelectedTime: (selectedTime) => set({ selectedTime }),

            setPendingToken: (pendingToken) => set({ pendingToken }),

            resetBooking: () => set({ ...initialState, formData: initialFormData }),
        }),
        { name: "3s-booking-storage" }
    )
);