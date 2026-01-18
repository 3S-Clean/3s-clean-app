// lib/booking/config.ts

// =============================================
// 3S Clean Booking Configuration
// =============================================

// ---- Types (строгие id, чтобы TS помогал) ----
export type ServiceId = "regular" | "initial" | "complete" | "handover";
export type ApartmentSizeId = "up-to-60" | "60-80" | "80-110" | "over-110";
export type PeopleCountId = "1-2" | "3-4" | "5+";

export type ExtrasMap = Record<string, number>;

// Final prices from spreadsheet (Euro incl. VAT)
// Structure: [size][service][people][pet: true/false]
export const FINAL_PRICES: Record<
    ApartmentSizeId,
    Record<ServiceId, Record<PeopleCountId, { noPet: number; pet: number }>>
> = {
    "up-to-60": {
        initial: {
            "1-2": { noPet: 165.0, pet: 181.5 },
            "3-4": { noPet: 189.75, pet: 206.25 },
            "5+": { noPet: 198.0, pet: 214.5 },
        },
        regular: {
            "1-2": { noPet: 120.0, pet: 132.0 },
            "3-4": { noPet: 138.0, pet: 150.0 },
            "5+": { noPet: 144.0, pet: 156.0 },
        },
        complete: {
            "1-2": { noPet: 200.0, pet: 220.0 },
            "3-4": { noPet: 230.0, pet: 250.0 },
            "5+": { noPet: 240.0, pet: 260.0 },
        },
        handover: {
            "1-2": { noPet: 220.0, pet: 242.0 },
            "3-4": { noPet: 253.0, pet: 275.0 },
            "5+": { noPet: 264.0, pet: 286.0 },
        },
    },
    "60-80": {
        initial: {
            "1-2": { noPet: 185.0, pet: 203.5 },
            "3-4": { noPet: 212.75, pet: 231.25 },
            "5+": { noPet: 222.0, pet: 240.5 },
        },
        regular: {
            "1-2": { noPet: 145.0, pet: 159.5 },
            "3-4": { noPet: 166.75, pet: 181.25 },
            "5+": { noPet: 174.0, pet: 188.5 },
        },
        complete: {
            "1-2": { noPet: 245.0, pet: 269.5 },
            "3-4": { noPet: 281.75, pet: 306.25 },
            "5+": { noPet: 294.0, pet: 318.5 },
        },
        handover: {
            "1-2": { noPet: 260.0, pet: 286.0 },
            "3-4": { noPet: 299.0, pet: 325.0 },
            "5+": { noPet: 312.0, pet: 338.0 },
        },
    },
    "80-110": {
        initial: {
            "1-2": { noPet: 230.0, pet: 253.0 },
            "3-4": { noPet: 264.5, pet: 287.5 },
            "5+": { noPet: 276.0, pet: 299.0 },
        },
        regular: {
            "1-2": { noPet: 190.0, pet: 209.0 },
            "3-4": { noPet: 218.5, pet: 237.5 },
            "5+": { noPet: 228.0, pet: 247.0 },
        },
        complete: {
            "1-2": { noPet: 295.0, pet: 324.5 },
            "3-4": { noPet: 339.25, pet: 368.75 },
            "5+": { noPet: 354.0, pet: 383.5 },
        },
        handover: {
            "1-2": { noPet: 315.0, pet: 346.5 },
            "3-4": { noPet: 362.25, pet: 393.75 },
            "5+": { noPet: 378.0, pet: 409.5 },
        },
    },
    "over-110": {
        initial: {
            "1-2": { noPet: 275.0, pet: 302.5 },
            "3-4": { noPet: 316.25, pet: 343.75 },
            "5+": { noPet: 330.0, pet: 357.5 },
        },
        regular: {
            "1-2": { noPet: 235.0, pet: 258.5 },
            "3-4": { noPet: 270.25, pet: 293.75 },
            "5+": { noPet: 282.0, pet: 305.5 },
        },
        complete: {
            "1-2": { noPet: 345.0, pet: 379.5 },
            "3-4": { noPet: 396.75, pet: 431.25 },
            "5+": { noPet: 414.0, pet: 448.5 },
        },
        handover: {
            "1-2": { noPet: 385.0, pet: 423.5 },
            "3-4": { noPet: 442.75, pet: 481.25 },
            "5+": { noPet: 462.0, pet: 500.5 },
        },
    },
};

// Hours per service and apartment size
export const HOURS_MATRIX: Record<ServiceId, Record<ApartmentSizeId, number>> = {
    initial: { "up-to-60": 3.5, "60-80": 4, "80-110": 5, "over-110": 6 },
    regular: { "up-to-60": 2.5, "60-80": 3, "80-110": 4, "over-110": 5 },
    complete: { "up-to-60": 4, "60-80": 5, "80-110": 6, "over-110": 7 },
    handover: { "up-to-60": 4.5, "60-80": 5.5, "80-110": 6.5, "over-110": 8 },
};

// Service types
export interface Service {
    id: ServiceId;
    name: string;
    description: string;
    startingPrice: number;
    isDark: boolean;
    includes: string[];
}

export const SERVICES: Service[] = [
    {
        id: "regular",
        name: "3S Regular Maintenance",
        description: "Weekly or bi-weekly cleaning to keep your home tidy and fresh.",
        startingPrice: 120,
        isDark: false,
        includes: [
            "Floors",
            "Visible Surfaces",
            "Kitchen",
            "Bathroom",
            "Interior doors and switches",
            "Beds",
            "Trash bins",
            "Room airing",
        ],
    },
    {
        id: "initial",
        name: "3S Deep Reset",
        description:
            "Recommended for all first-time clients to bring your home to a level where it can be efficiently maintained thereafter.",
        startingPrice: 165,
        isDark: true,
        includes: ["All Regular Maintenance features", "Deep Visible Surfaces", "Deep Kitchen", "Deep Bathroom", "Windows"],
    },
    {
        id: "complete",
        name: "3S Intensive Care",
        description:
            'Intensive cleaning for a "reset" of your home after a party or when it has not been cleaned properly for a longer period.',
        startingPrice: 200,
        isDark: false,
        includes: ["All Deep Clean features", "Deep Visible Surfaces", "Furniture", "Upholstery", "Trash disposal"],
    },
    {
        id: "handover",
        name: "3S Handover",
        description: "Specialized cleaning before handover to landlord or before moving in.",
        startingPrice: 220,
        isDark: true,
        includes: [
            "All Complete Reset features",
            "Cupboards and Drawers",
            "Oven",
            "Fridge/Freezer",
            "Interior doors and switches",
            "Deep Bathroom",
            "Windows",
        ],
    },
];

// Apartment sizes
export interface ApartmentSize {
    id: ApartmentSizeId;
    name: string;
    label: string;
}

export const APARTMENT_SIZES: ApartmentSize[] = [
    { id: "up-to-60", name: "Up to 60 m²", label: "< 60 m²" },
    { id: "60-80", name: "60-80 m²", label: "60-80 m²" },
    { id: "80-110", name: "80-110 m²", label: "80-110 m²" },
    { id: "over-110", name: "Over 110 m²", label: "> 110 m²" },
];

// People options
export interface PeopleOption {
    id: PeopleCountId;
    name: string;
    label: string;
}

export const PEOPLE_OPTIONS: PeopleOption[] = [
    { id: "1-2", name: "1-2 people", label: "1-2" },
    { id: "3-4", name: "3-4 people", label: "3-4" },
    { id: "5+", name: "5+ people", label: "5+" },
];

// Extra services
export interface Extra {
    id: string;
    name: string;
    price: number;
    hours: number;
    icon: string;
    unit: string;
}

export const EXTRAS: Extra[] = [
    { id: "linen-single", name: "Linen change - single bed", price: 7.5, hours: 0.13, icon: "🛏️", unit: "bed" },
    { id: "linen-double", name: "Linen change - double bed", price: 14.0, hours: 0.25, icon: "🛏️", unit: "bed" },
    { id: "oven", name: "Oven deep clean (inside)", price: 100.0, hours: 2.0, icon: "🔥", unit: "unit" },
    { id: "fridge", name: "Fridge deep clean (inside)", price: 50.0, hours: 1.0, icon: "❄️", unit: "unit" },
    { id: "freezer", name: "Freezer deep clean", price: 50.0, hours: 1.0, icon: "🧊", unit: "unit" },
    { id: "windows-inside", name: "Window cleaning - inside", price: 4.25, hours: 0.08, icon: "🪟", unit: "m² glass" },
    { id: "windows-outside", name: "Window cleaning - outside", price: 4.5, hours: 0.08, icon: "🪟", unit: "m² glass" },
    { id: "balcony", name: "Balcony / terrace cleaning", price: 52.5, hours: 1.0, icon: "🌿", unit: "10 m²" },
    { id: "limescale", name: "Limescale removal - intensive", price: 27.0, hours: 0.5, icon: "🚿", unit: "30-min block" },
    { id: "cupboards", name: "Cupboards / cabinets - deep clean", price: 50.0, hours: 1.0, icon: "🗄️", unit: "hour" },
    { id: "wardrobe", name: "Wardrobe arranging / folding", price: 50.0, hours: 1.0, icon: "👔", unit: "hour" },
    { id: "sofa", name: "Sofa upholstery vacuuming", price: 6.5, hours: 0.08, icon: "🛋️", unit: "seat" },
];

// Time slots
export interface TimeSlot {
    id: TimeSlotId;
    label: string;
    hour: number;
}

export type TimeSlotId =
    | "08:00"
    | "09:00"
    | "10:00"
    | "11:00"
    | "12:00"
    | "13:00"
    | "14:00"
    | "15:00"
    | "16:00"
    | "17:00"
    | "18:00";

export const TIME_SLOTS: TimeSlot[] = [
    { id: "08:00", label: "8:00", hour: 8 },
    { id: "09:00", label: "9:00", hour: 9 },
    { id: "10:00", label: "10:00", hour: 10 },
    { id: "11:00", label: "11:00", hour: 11 },
    { id: "12:00", label: "12:00", hour: 12 },
    { id: "13:00", label: "13:00", hour: 13 },
    { id: "14:00", label: "14:00", hour: 14 },
    { id: "15:00", label: "15:00", hour: 15 },
    { id: "16:00", label: "16:00", hour: 16 },
    { id: "17:00", label: "17:00", hour: 17 },
    { id: "18:00", label: "18:00", hour: 18 },
];

// Allowed postal codes (Stuttgart area)
export const ALLOWED_POSTAL_CODES = new Set<string>([
    "70173", "70174", "70176", "70178", "70180", "70182", "70184", "70186", "70188",
    "70190", "70191", "70192", "70193", "70195", "70197", "70199",
    "70563", "70565", "70567", "70569",
    "70597", "70599",
    "70469", "70499",
]);

export function isAllowedPostalCode(code: string): boolean {
    const cleaned = code.trim();
    return ALLOWED_POSTAL_CODES.has(cleaned);
}

// Baden-Württemberg holidays
export const HOLIDAYS: string[] = [
    // 2025
    "2025-01-01", "2025-01-06", "2025-04-18", "2025-04-21", "2025-05-01",
    "2025-05-29", "2025-06-09", "2025-06-19", "2025-10-03", "2025-11-01",
    "2025-12-25", "2025-12-26",
    // 2026
    "2026-01-01", "2026-01-06", "2026-04-03", "2026-04-06", "2026-05-01",
    "2026-05-14", "2026-05-25", "2026-06-04", "2026-10-03", "2026-11-01",
    "2026-12-25", "2026-12-26",
];

// Helper functions
export function calculatePrice(
    serviceId: ServiceId,
    sizeId: ApartmentSizeId,
    peopleId: PeopleCountId,
    hasPets: boolean,
    extras: ExtrasMap
): { basePrice: number; extrasPrice: number; totalPrice: number } {
    const petKey = hasPets ? "pet" : "noPet";
    const basePrice = FINAL_PRICES[sizeId]?.[serviceId]?.[peopleId]?.[petKey] ?? 0;

    let extrasPrice = 0;
    for (const [extraId, quantity] of Object.entries(extras)) {
        const extra = EXTRAS.find((e) => e.id === extraId);
        if (extra && quantity > 0) extrasPrice += extra.price * quantity;
    }

    const total = basePrice + extrasPrice;

    return {
        basePrice: round2(basePrice),
        extrasPrice: round2(extrasPrice),
        totalPrice: round2(total),
    };
}

export function calculateHours(serviceId: ServiceId, sizeId: ApartmentSizeId, extras: ExtrasMap): number {
    let hours = HOURS_MATRIX[serviceId]?.[sizeId] ?? 0;

    for (const [extraId, quantity] of Object.entries(extras)) {
        const extra = EXTRAS.find((e) => e.id === extraId);
        if (extra && quantity > 0) hours += extra.hours * quantity;
    }

    return round2(hours);
}

export function formatHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) return `${wholeHours}h`;
    if (wholeHours === 0) return `${minutes}min`;
    return `${wholeHours}h ${minutes}min`;
}

export function isHoliday(dateKey: string): boolean {
    return HOLIDAYS.includes(dateKey);
}

export function isSunday(date: Date): boolean {
    return date.getDay() === 0;
}

// YYYY-MM-DD
export function formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "HH:mm" + hours => "HH:mm"
export function addHoursToTime(time: TimeSlotId | string, hours: number): string {
    const [hStr, mStr = "0"] = time.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return time;

    const totalMin = h * 60 + m + Math.round(hours * 60);
    const endH = Math.floor((totalMin / 60) % 24);
    const endM = totalMin % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}