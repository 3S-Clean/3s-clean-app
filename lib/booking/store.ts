import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApartmentSizeId, PeopleCountId, ServiceId, TimeSlotId } from "@/lib/booking/config";

export interface BookingExtras {
    [key: string]: number;
}

export interface BookingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
}

export interface BookingState {
    // Step tracking
    step: number;

    // Step 0: Postcode
    postcode: string;
    postcodeVerified: boolean;

    // Step 1: Service
    selectedService: ServiceId | null;

    // Step 2: Apartment details
    apartmentSize: ApartmentSizeId | null;
    peopleCount: PeopleCountId | null;
    hasPets: boolean;
    hasKids: boolean;
    hasAllergies: boolean;
    allergyNote: string;

    // Step 3: Extras
    extras: BookingExtras;

    // Step 4: Contact & Schedule
    formData: BookingFormData;
    selectedDate: string | null; // YYYY-MM-DD
    selectedTime: TimeSlotId | null;

    // Persisted across signup -> verify -> set-password
    // This must survive page reload.
    pendingToken: string | null;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setPostcode: (postcode: string) => void;
    setPostcodeVerified: (verified: boolean) => void;

    setSelectedService: (service: ServiceId | null) => void;

    setApartmentSize: (size: ApartmentSizeId | null) => void;
    setPeopleCount: (count: PeopleCountId | null) => void;
    setHasPets: (hasPets: boolean) => void;
    setHasKids: (hasKids: boolean) => void;
    setHasAllergies: (hasAllergies: boolean) => void;
    setAllergyNote: (note: string) => void;

    updateExtra: (extraId: string, delta: number) => void;
    setExtra: (extraId: string, qty: number) => void;
    clearExtras: () => void;

    setFormData: (data: Partial<BookingFormData>) => void;
    setSelectedDate: (date: string | null) => void;
    setSelectedTime: (time: TimeSlotId | null) => void;

    setPendingToken: (token: string | null) => void;

    reset: () => void;
}

const initialFormData: BookingFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
};

const initialState: Omit<
    BookingState,
    | "setStep"
    | "nextStep"
    | "prevStep"
    | "setPostcode"
    | "setPostcodeVerified"
    | "setSelectedService"
    | "setApartmentSize"
    | "setPeopleCount"
    | "setHasPets"
    | "setHasKids"
    | "setHasAllergies"
    | "setAllergyNote"
    | "updateExtra"
    | "setExtra"
    | "clearExtras"
    | "setFormData"
    | "setSelectedDate"
    | "setSelectedTime"
    | "setPendingToken"
    | "reset"
> = {
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
};

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            ...initialState,

            setStep: (step) => set({ step }),
            nextStep: () => set((state) => ({ step: state.step + 1 })),
            prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),

            setPostcode: (postcode) => set({ postcode }),
            setPostcodeVerified: (postcodeVerified) => set({ postcodeVerified }),

            setSelectedService: (selectedService) => set({ selectedService }),

            setApartmentSize: (apartmentSize) => set({ apartmentSize }),
            setPeopleCount: (peopleCount) => set({ peopleCount }),
            setHasPets: (hasPets) => set({ hasPets }),
            setHasKids: (hasKids) => set({ hasKids }),
            setHasAllergies: (hasAllergies) => set({ hasAllergies }),
            setAllergyNote: (allergyNote) => set({ allergyNote }),

            updateExtra: (extraId, delta) =>
                set((state) => {
                    const next = Math.max(0, (state.extras[extraId] || 0) + delta);
                    const extras = { ...state.extras };
                    if (next === 0) delete extras[extraId];
                    else extras[extraId] = next;
                    return { extras };
                }),

            setExtra: (extraId, qty) =>
                set((state) => {
                    const q = Math.max(0, Number(qty) || 0);
                    const extras = { ...state.extras };
                    if (q === 0) delete extras[extraId];
                    else extras[extraId] = q;
                    return { extras };
                }),

            clearExtras: () => set({ extras: {} }),

            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),

            setSelectedDate: (selectedDate) => set({ selectedDate, selectedTime: null }),
            setSelectedTime: (selectedTime) => set({ selectedTime }),

            setPendingToken: (pendingToken) => set({ pendingToken }),

            reset: () =>
                set({
                    ...initialState,
                    formData: initialFormData,
                }),
        }),
        {
            name: "3s-booking-storage",
            version: 1,
            partialize: (state) => ({
                postcode: state.postcode,
                postcodeVerified: state.postcodeVerified,

                selectedService: state.selectedService,
                apartmentSize: state.apartmentSize,
                peopleCount: state.peopleCount,

                hasPets: state.hasPets,
                hasKids: state.hasKids,
                hasAllergies: state.hasAllergies,
                allergyNote: state.allergyNote,

                extras: state.extras,

                formData: state.formData,
                selectedDate: state.selectedDate,
                selectedTime: state.selectedTime,

                pendingToken: state.pendingToken,
            }),
        }
    )
);