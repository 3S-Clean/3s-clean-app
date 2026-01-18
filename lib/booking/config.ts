// lib/booking/config.ts

export type ServiceId = "regular" | "initial" | "complete" | "handover";
export type ApartmentSizeId = "up-to-60" | "60-80" | "80-110" | "over-110";
export type PeopleCountId = "1-2" | "3-4" | "5+";

export type ExtrasMap = Record<string, number>;

export const FINAL_PRICES: Record<
    ApartmentSizeId,
    Record<ServiceId, Record<PeopleCountId, { noPet: number; pet: number }>>
> = {
    "up-to-60": {
        initial: { "1-2": { noPet: 165, pet: 181.5 }, "3-4": { noPet: 189.75, pet: 206.25 }, "5+": { noPet: 198, pet: 214.5 } },
        regular: { "1-2": { noPet: 120, pet: 132 }, "3-4": { noPet: 138, pet: 150 }, "5+": { noPet: 144, pet: 156 } },
        complete: { "1-2": { noPet: 200, pet: 220 }, "3-4": { noPet: 230, pet: 250 }, "5+": { noPet: 240, pet: 260 } },
        handover: { "1-2": { noPet: 220, pet: 242 }, "3-4": { noPet: 253, pet: 275 }, "5+": { noPet: 264, pet: 286 } },
    },
    "60-80": {
        initial: { "1-2": { noPet: 185, pet: 203.5 }, "3-4": { noPet: 212.75, pet: 231.25 }, "5+": { noPet: 222, pet: 240.5 } },
        regular: { "1-2": { noPet: 145, pet: 159.5 }, "3-4": { noPet: 166.75, pet: 181.25 }, "5+": { noPet: 174, pet: 188.5 } },
        complete: { "1-2": { noPet: 245, pet: 269.5 }, "3-4": { noPet: 281.75, pet: 306.25 }, "5+": { noPet: 294, pet: 318.5 } },
        handover: { "1-2": { noPet: 260, pet: 286 }, "3-4": { noPet: 299, pet: 325 }, "5+": { noPet: 312, pet: 338 } },
    },
    "80-110": {
        initial: { "1-2": { noPet: 230, pet: 253 }, "3-4": { noPet: 264.5, pet: 287.5 }, "5+": { noPet: 276, pet: 299 } },
        regular: { "1-2": { noPet: 190, pet: 209 }, "3-4": { noPet: 218.5, pet: 237.5 }, "5+": { noPet: 228, pet: 247 } },
        complete: { "1-2": { noPet: 295, pet: 324.5 }, "3-4": { noPet: 339.25, pet: 368.75 }, "5+": { noPet: 354, pet: 383.5 } },
        handover: { "1-2": { noPet: 315, pet: 346.5 }, "3-4": { noPet: 362.25, pet: 393.75 }, "5+": { noPet: 378, pet: 409.5 } },
    },
    "over-110": {
        initial: { "1-2": { noPet: 275, pet: 302.5 }, "3-4": { noPet: 316.25, pet: 343.75 }, "5+": { noPet: 330, pet: 357.5 } },
        regular: { "1-2": { noPet: 235, pet: 258.5 }, "3-4": { noPet: 270.25, pet: 293.75 }, "5+": { noPet: 282, pet: 305.5 } },
        complete: { "1-2": { noPet: 345, pet: 379.5 }, "3-4": { noPet: 396.75, pet: 431.25 }, "5+": { noPet: 414, pet: 448.5 } },
        handover: { "1-2": { noPet: 385, pet: 423.5 }, "3-4": { noPet: 442.75, pet: 481.25 }, "5+": { noPet: 462, pet: 500.5 } },
    },
};

export const HOURS_MATRIX: Record<ServiceId, Record<ApartmentSizeId, number>> = {
    initial: { "up-to-60": 3.5, "60-80": 4, "80-110": 5, "over-110": 6 },
    regular: { "up-to-60": 2.5, "60-80": 3, "80-110": 4, "over-110": 5 },
    complete: { "up-to-60": 4, "60-80": 5, "80-110": 6, "over-110": 7 },
    handover: { "up-to-60": 4.5, "60-80": 5.5, "80-110": 6.5, "over-110": 8 },
};

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
        includes: ["Floors", "Visible Surfaces", "Kitchen", "Bathroom", "Interior doors and switches", "Beds", "Trash bins", "Room airing"],
    },
    {
        id: "initial",
        name: "3S Deep Reset",
        description: "Recommended for all first-time clients to bring your home to a level where it can be efficiently maintained thereafter.",
        startingPrice: 165,
        isDark: true,
        includes: ["All Regular Maintenance features", "Deep Visible Surfaces", "Deep Kitchen", "Deep Bathroom", "Windows"],
    },
    {
        id: "complete",
        name: "3S Intensive Care",
        description: 'Intensive cleaning for a "reset" of your home after a party or when it has not been cleaned properly for a longer period.',
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
        includes: ["All Complete Reset features", "Cupboards and Drawers", "Oven", "Fridge/Freezer", "Interior doors and switches", "Deep Bathroom", "Windows"],
    },
];

export const APARTMENT_SIZES = [
    { id: "up-to-60" as const, label: "< 60 m²" },
    { id: "60-80" as const, label: "60-80 m²" },
    { id: "80-110" as const, label: "80-110 m²" },
    { id: "over-110" as const, label: "> 110 m²" },
];

export const PEOPLE_OPTIONS = [
    { id: "1-2" as const, label: "1-2" },
    { id: "3-4" as const, label: "3-4" },
    { id: "5+" as const, label: "5+" },
];

export interface Extra {
    id: string;
    name: string;
    price: number;
    hours: number;
    icon: string; // ключ для lucide
    unit: string;
}

export const EXTRAS: Extra[] = [
    { id: "linen-single", name: "Linen change - single bed", price: 7.5, hours: 0.13, icon: "bed-single", unit: "bed" },
    { id: "linen-double", name: "Linen change - double bed", price: 14.0, hours: 0.25, icon: "bed-double", unit: "bed" },
    { id: "oven", name: "Oven deep clean (inside)", price: 100.0, hours: 2.0, icon: "flame", unit: "unit" },
    { id: "fridge", name: "Fridge deep clean (inside)", price: 50.0, hours: 1.0, icon: "refrigerator", unit: "unit" },
    { id: "freezer", name: "Freezer deep clean", price: 50.0, hours: 1.0, icon: "snowflake", unit: "unit" },
    { id: "windows-inside", name: "Window cleaning - inside", price: 4.25, hours: 0.08, icon: "app-window", unit: "m² glass" },
    { id: "windows-outside", name: "Window cleaning - outside", price: 4.5, hours: 0.08, icon: "app-window", unit: "m² glass" },
    { id: "balcony", name: "Balcony / terrace cleaning", price: 52.5, hours: 1.0, icon: "trees", unit: "10 m²" },
    { id: "limescale", name: "Limescale removal - intensive", price: 27.0, hours: 0.5, icon: "droplets", unit: "30-min block" },
    { id: "cupboards", name: "Cupboards / cabinets - deep clean", price: 50.0, hours: 1.0, icon: "archive", unit: "hour" },
    { id: "wardrobe", name: "Wardrobe arranging / folding", price: 50.0, hours: 1.0, icon: "shirt", unit: "hour" },
    { id: "sofa", name: "Sofa upholstery vacuuming", price: 6.5, hours: 0.08, icon: "sofa", unit: "seat" },
];

export type TimeSlotId = string;

export interface TimeSlot {
    id: TimeSlotId; // "HH:mm"
    label: string;  // "8:00"
    hour: number;
    minutes: number;
}

// 15-min slots, 08:00–17:45
export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 40 }, (_, i) => {
    const totalMinutes = 8 * 60 + i * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const id = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return { id, label: `${hour}:${String(minutes).padStart(2, "0")}`, hour, minutes };
});

export const WORKING_HOURS_END = 18;

export const ALLOWED_POSTAL_CODES = new Set([
    "70173","70174","70176","70178","70180","70182","70184","70186","70188",
    "70190","70191","70192","70193","70195","70197","70199",
    "70563","70565","70567","70569",
    "70597","70599",
    "70469","70499",
]);

export const HOLIDAYS: string[] = [
    "2025-01-01","2025-01-06","2025-04-18","2025-04-21","2025-05-01",
    "2025-05-29","2025-06-09","2025-06-19","2025-10-03","2025-11-01",
    "2025-12-25","2025-12-26",
    "2026-01-01","2026-01-06","2026-04-03","2026-04-06","2026-05-01",
    "2026-05-14","2026-05-25","2026-06-04","2026-10-03","2026-11-01",
    "2026-12-25","2026-12-26",
];

export const isHoliday = (dateStr: string) => HOLIDAYS.includes(dateStr);
export const isSunday = (d: Date) => d.getDay() === 0;

export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * ✅ Совместимость со старым booking-config.ts:
 * чтобы booking-actions / компоненты могли импортить те же имена
 */
export function getBasePrice(service: ServiceId, size: ApartmentSizeId, people: PeopleCountId, hasPets: boolean) {
    const p = FINAL_PRICES[size]?.[service]?.[people];
    if (!p) return 0;
    return hasPets ? p.pet : p.noPet;
}

export function getEstimatedHours(service: ServiceId, size: ApartmentSizeId) {
    return HOURS_MATRIX[service]?.[size] ?? 0;
}

export function calculatePrice(
    serviceId: ServiceId,
    sizeId: ApartmentSizeId,
    peopleId: PeopleCountId,
    hasPets: boolean,
    extras: ExtrasMap
) {
    const basePrice = getBasePrice(serviceId, sizeId, peopleId, hasPets);

    let extrasPrice = 0;
    for (const [extraId, quantity] of Object.entries(extras ?? {})) {
        const q = Number(quantity);
        if (!Number.isFinite(q) || q <= 0) continue;
        const extra = EXTRAS.find((e) => e.id === extraId);
        if (extra) extrasPrice += extra.price * q;
    }

    return {
        basePrice: round2(basePrice),
        extrasPrice: round2(extrasPrice),
        totalPrice: round2(basePrice + extrasPrice),
    };
}

export function calculateHours(serviceId: ServiceId, sizeId: ApartmentSizeId, extras: ExtrasMap) {
    let hours = HOURS_MATRIX[serviceId]?.[sizeId] ?? 0;

    for (const [extraId, quantity] of Object.entries(extras ?? {})) {
        const q = Number(quantity);
        if (!Number.isFinite(q) || q <= 0) continue;
        const extra = EXTRAS.find((e) => e.id === extraId);
        if (extra) hours += extra.hours * q;
    }

    return round2(hours);
}

export function formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
}

export function formatDateKey(year: number, month: number, day: number): string {
    // month = 0..11
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "HH:mm" + hours -> "HH:mm"
export function addHoursToTime(time: string, hours: number): string {
    const [hStr, mStr = "0"] = (time ?? "").split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return time;

    const totalMin = h * 60 + m + Math.round(hours * 60);
    const endH = Math.floor((totalMin / 60) % 24);
    const endM = totalMin % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}