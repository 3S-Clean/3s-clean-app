// lib/booking/config.ts
export const SERVICES = [
    {
        id: "core",
        isDark: false,
        startingPrice: 120,
        includesKeys: [
            "floors",
            "kitchen",
            "bathroom",
            "surfaces",
            "windowsInside",
            "doors",
            "beds",
            "trash",
            "general",
        ]
    },
    {
        id: "initial",
        isDark: false,
        startingPrice: 165,
        includesKeys: [
            "kitchen",
            "bathroom",
            "surfaces",
            "windowsInside",
        ]
    },
    {
        id: "reset",
        isDark: true,
        startingPrice: 200,
        includesKeys: [
            "floors",
            "kitchen",
            "bathroom",
            "surfaces",
            "upholstery",
            "trash",
        ]
    },
    {
        id: "handover",
        isDark: true,
        startingPrice: 220,
        includesKeys: [
            "bathroom",
            "insideCupboards",
            "oven",
            "fridge",
            "doors",
            "windowsInside",
            "walls",
            "trash",
        ]
    },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export type ServiceIncludeKey = (typeof SERVICES)[number]["includesKeys"][number];

/* =========================
   APARTMENT / PEOPLE
========================= */

export const APARTMENT_SIZES = [
    {id: "up-to-60", label: "< 60 m²"},
    {id: "60-100", label: "60–100 m²"},
    {id: "100-140", label: "100–140 m²"},
    {id: "over-140", label: "> 140 m²"},
] as const;

export const PEOPLE_OPTIONS = [
    {id: "1-2", label: "1–2"},
    {id: "3-4", label: "3–4"},
    {id: "5+", label: "5+"},
] as const;

export type ApartmentSizeId = (typeof APARTMENT_SIZES)[number]["id"];
export type PeopleCountId = (typeof PEOPLE_OPTIONS)[number]["id"];

/* =========================
   PRICES (TYPES)
========================= */

type PetKey = "noPet" | "pet";

export type FinalPrices = Record<
    ApartmentSizeId,
    Record<ServiceId, Record<PeopleCountId, Record<PetKey, number>>>
>;

export type HoursMatrix = Record<ServiceId, Record<ApartmentSizeId, number>>;

/* =========================
   PRICES
========================= */

export const FINAL_PRICES: FinalPrices = {
    "up-to-60": {
        core: {"1-2": {noPet: 120, pet: 132}, "3-4": {noPet: 138, pet: 150}, "5+": {noPet: 144, pet: 156}},
        initial: {"1-2": {noPet: 165, pet: 181.5}, "3-4": {noPet: 189.75, pet: 206.25}, "5+": {noPet: 198, pet: 214.5}},
        reset: {"1-2": {noPet: 200, pet: 220}, "3-4": {noPet: 230, pet: 250}, "5+": {noPet: 240, pet: 260}},
        handover: {"1-2": {noPet: 220, pet: 242}, "3-4": {noPet: 253, pet: 275}, "5+": {noPet: 264, pet: 286}},
    },
    "60-100": {
        core: {"1-2": {noPet: 145, pet: 159.5}, "3-4": {noPet: 166.75, pet: 181.25}, "5+": {noPet: 174, pet: 188.5}},
        initial: {"1-2": {noPet: 185, pet: 203.5}, "3-4": {noPet: 212.75, pet: 231.25}, "5+": {noPet: 222, pet: 240.5}},
        reset: {"1-2": {noPet: 245, pet: 269.5}, "3-4": {noPet: 281.75, pet: 306.25}, "5+": {noPet: 294, pet: 318.5}},
        handover: {"1-2": {noPet: 260, pet: 286}, "3-4": {noPet: 299, pet: 325}, "5+": {noPet: 312, pet: 338}},
    },
    "100-140": {
        core: {"1-2": {noPet: 190, pet: 209}, "3-4": {noPet: 218.5, pet: 237.5}, "5+": {noPet: 228, pet: 247}},
        initial: {"1-2": {noPet: 230, pet: 253}, "3-4": {noPet: 264.5, pet: 287.5}, "5+": {noPet: 276, pet: 299}},
        reset: {"1-2": {noPet: 295, pet: 324.5}, "3-4": {noPet: 339.25, pet: 368.75}, "5+": {noPet: 354, pet: 383.5}},
        handover: {
            "1-2": {noPet: 315, pet: 346.5},
            "3-4": {noPet: 362.25, pet: 393.75},
            "5+": {noPet: 378, pet: 409.5}
        },
    },
    "over-140": {
        core: {"1-2": {noPet: 235, pet: 258.5}, "3-4": {noPet: 270.25, pet: 293.75}, "5+": {noPet: 282, pet: 305.5}},
        initial: {"1-2": {noPet: 275, pet: 302.5}, "3-4": {noPet: 316.25, pet: 343.75}, "5+": {noPet: 330, pet: 357.5}},
        reset: {"1-2": {noPet: 345, pet: 379.5}, "3-4": {noPet: 396.75, pet: 431.25}, "5+": {noPet: 414, pet: 448.5}},
        handover: {
            "1-2": {noPet: 385, pet: 423.5},
            "3-4": {noPet: 442.75, pet: 481.25},
            "5+": {noPet: 462, pet: 500.5}
        },
    },
};

/* =========================
   HOURS
========================= */

export const HOURS_MATRIX: HoursMatrix = {
    core: {"up-to-60": 2.5, "60-100": 3, "100-140": 4, "over-140": 5},
    initial: {"up-to-60": 3.5, "60-100": 4, "100-140": 5, "over-140": 6},
    reset: {"up-to-60": 4, "60-100": 5, "100-140": 6, "over-140": 7},
    handover: {"up-to-60": 4.5, "60-100": 5.5, "100-140": 7, "over-140": 8},
};

/* =========================
   EXTRAS (NO TEXTS)
   i18n keys:
   - extras.<id>.name
   - extras.<id>.unit
========================= */

export const EXTRAS = [
    {id: "linen-single", price: 7.5, hours: 0.13},
    {id: "linen-double", price: 14, hours: 0.25},
    {id: "oven", price: 100, hours: 2},
    {id: "fridge", price: 50, hours: 1},
    {id: "freezer", price: 50, hours: 1},
    {id: "windows-inside", price: 4.25, hours: 0.08},
    {id: "windows-outside", price: 4.5, hours: 0.08},
    {id: "balcony", price: 52.5, hours: 1},
    {id: "limescale", price: 27, hours: 0.5},
    {id: "cupboards", price: 50, hours: 1},
    {id: "wardrobe", price: 50, hours: 1},
    {id: "sofa", price: 6.5, hours: 0.08},
] as const;

export type ExtraId = (typeof EXTRAS)[number]["id"];

/* =========================
   TIME
========================= */

export const TIME_SLOTS = Array.from({length: 40}, (_, i) => {
    const total = 8 * 60 + i * 15;
    const h = Math.floor(total / 60);
    const m = total % 60;

    return {
        id: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        label: `${h}:${String(m).padStart(2, "0")}`,
        hour: h,
        minutes: m,
    };
});

export const WORKING_HOURS_END = 18;

/* =========================
   ROUNDING HELPERS
========================= */

export function roundMinutesToQuarterUp(minutes: number) {
    if (!Number.isFinite(minutes) || minutes <= 0) return 0;
    return Math.ceil(minutes / 15) * 15;
}

export function roundHoursToQuarterUp(hours: number) {
    if (!Number.isFinite(hours) || hours <= 0) return 0;
    return roundMinutesToQuarterUp(hours * 60) / 60;
}

/* =========================
   HOLIDAYS (blocking dates)
========================= */

export const HOLIDAYS = new Set<string>([
    "2025-01-01", "2025-01-06", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-29", "2025-06-09", "2025-06-19", "2025-10-03", "2025-11-01", "2025-12-25", "2025-12-26",
    "2026-01-01", "2026-01-06", "2026-04-03", "2026-04-06", "2026-05-01", "2026-05-14", "2026-05-25", "2026-06-04", "2026-10-03", "2026-11-01", "2026-12-25", "2026-12-26",
]);

export const isHoliday = (isoDate: string) => HOLIDAYS.has(isoDate);

/* =========================
   SERVICE AREAS
========================= */

export const SERVICE_AREAS = [
    "70173", "70174", "70176", "70178", "70180", "70182", "70184", "70186", "70188", "70190",
    "70191", "70192", "70193", "70195", "70197", "70199", "70327", "70329", "70372", "70374",
    "70376", "70378", "70435", "70437", "70439", "70469", "70499", "70563", "70565", "70567",
    "70569", "70597", "70599",
] as const;

/* =========================
   HELPERS (TYPED)
========================= */

export const getBasePrice = (
    service: ServiceId,
    size: ApartmentSizeId,
    people: PeopleCountId,
    hasPets: boolean
) => {
    const p = FINAL_PRICES[size]?.[service]?.[people];
    return p ? (hasPets ? p.pet : p.noPet) : 0;
};

export const getEstimatedHours = (service: ServiceId, size: ApartmentSizeId) =>
    HOURS_MATRIX[service]?.[size] ?? 0;
