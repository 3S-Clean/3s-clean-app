// lib/booking/store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    notes: string;
}

export interface BookingState {
    step: number;
    setStep: (step: number) => void;

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

const MIN_STEP = 0;
const MAX_STEP = 4;

function clampStep(n: number) {
    return Math.max(MIN_STEP, Math.min(MAX_STEP, n));
}

const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    address: "",
    postalCode: "",
    city: "",
    country: "Germany",

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

// Persist slice
type PersistSlice = {
    formData: BookingState["formData"];
    selectedDate: string | null;
    selectedTime: string | null;
    _savedAt: number;
};

const DATA_TTL_MS = 30 * 60 * 1000;

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setStep: (step) =>
                set((state) => {
                    const next = clampStep(step);

                    // 🔒 guard: шаги > 0 только если verified
                    if (next > 0 && !state.postcodeVerified) return state;

                    return { step: next };
                }),

            setPostcode: (postcode) => set({ postcode }),

            setPostcodeVerified: (postcodeVerified) =>
                set((state) => {
                    // если снимаем verified — возвращаем на step 0
                    if (!postcodeVerified) return { postcodeVerified: false, step: 0 };
                    return { postcodeVerified: true };
                }),

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
        {
            name: "3s-booking-storage",

            partialize: (state): Partial<PersistSlice> => {
                if (state.step !== 4) return {};
                return {
                    formData: state.formData,
                    selectedDate: state.selectedDate,
                    selectedTime: state.selectedTime,
                    _savedAt: Date.now(),
                };
            },

            merge: (persisted, current) => {
                const p = persisted as Partial<PersistSlice> | undefined;
                if (!p?._savedAt) return current;
                if (Date.now() - p._savedAt > DATA_TTL_MS) return current;

                return {
                    ...current,
                    formData: p.formData ?? current.formData,
                    selectedDate: p.selectedDate ?? current.selectedDate,
                    selectedTime: p.selectedTime ?? current.selectedTime,
                };
            },
        }
    )
);