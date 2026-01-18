// lib/booking/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;

    city: string;
    postalCode: string;

    notes: string;
}

interface BookingState {
    step: number;
    setStep: (step: number) => void;

    nextStep: () => void;
    prevStep: () => void;

    postcode: string;
    setPostcode: (postcode: string) => void;

    // ✅ удобный синк, чтобы не забывать прокидывать postalCode в formData
    setPostcodeAndForm: (postcode: string) => void;

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
    city: "",
    postalCode: "",
    notes: "",
};

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            step: 0,
            setStep: (step) => set({ step }),

            nextStep: () => set({ step: get().step + 1 }),
            prevStep: () => set({ step: Math.max(0, get().step - 1) }),

            postcode: "",
            setPostcode: (postcode) => set({ postcode }),

            setPostcodeAndForm: (postcode) =>
                set((state) => ({
                    postcode,
                    formData: { ...state.formData, postalCode: postcode },
                })),

            postcodeVerified: false,
            setPostcodeVerified: (postcodeVerified) => set({ postcodeVerified }),

            selectedService: null,
            setSelectedService: (selectedService) => set({ selectedService }),

            apartmentSize: null,
            setApartmentSize: (apartmentSize) => set({ apartmentSize }),

            peopleCount: null,
            setPeopleCount: (peopleCount) => set({ peopleCount }),

            hasPets: false,
            setHasPets: (hasPets) => set({ hasPets }),

            hasKids: false,
            setHasKids: (hasKids) => set({ hasKids }),

            hasAllergies: false,
            setHasAllergies: (hasAllergies) => set({ hasAllergies }),

            allergyNote: "",
            setAllergyNote: (allergyNote) => set({ allergyNote }),

            extras: {},
            setExtras: (extras) => set({ extras }),
            updateExtra: (extraId, delta) =>
                set((state) => ({
                    extras: {
                        ...state.extras,
                        [extraId]: Math.max(0, (state.extras[extraId] || 0) + delta),
                    },
                })),

            formData: initialFormData,
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),

            selectedDate: null,
            setSelectedDate: (selectedDate) => set({ selectedDate }),

            selectedTime: null,
            setSelectedTime: (selectedTime) => set({ selectedTime }),

            pendingToken: null,
            setPendingToken: (pendingToken) => set({ pendingToken }),

            resetBooking: () =>
                set({
                    step: 0,
                    postcode: "",
                    postcodeVerified: false,
                    selectedService: null,
                    apartmentSize: null,
                    peopleCount: null,
                    hasPets: false,
                    hasKids: false,
                    hasAllergies: false,
                    allergyNote: "",
                    extras: {},
                    formData: initialFormData,
                    selectedDate: null,
                    selectedTime: null,
                    pendingToken: null,
                }),
        }),
        { name: "3s-booking-storage" }
    )
);