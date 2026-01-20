// lib/booking/config.ts

export const SERVICES = [
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
        includes: [
            "All Regular Maintenance features",
            "Deep Visible Surfaces",
            "Deep Kitchen",
            "Deep Bathroom",
            "Windows",
        ],
    },
    {
        id: "complete",
        name: "3S Intensive Care",
        description:
            'Intensive cleaning for a "reset" of your home after a party or when it has not been cleaned properly for a longer period.',
        startingPrice: 200,
        isDark: false,
        includes: [
            "All Deep Clean features",
            "Deep Visible Surfaces",
            "Furniture",
            "Upholstery",
            "Trash disposal",
        ],
    },
    {
        id: "handover",
        name: "3S Handover",
        description:
            "Specialized cleaning before handover to landlord or before moving in.",
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

/* =========================
   APARTMENT / PEOPLE
========================= */

export const APARTMENT_SIZES = [
    { id: "up-to-60", label: "< 60 m²" },
    { id: "60-80", label: "60–80 m²" },
    { id: "80-110", label: "80–110 m²" },
    { id: "over-110", label: "> 110 m²" },
];

export const PEOPLE_OPTIONS = [
    { id: "1-2", label: "1–2" },
    { id: "3-4", label: "3–4" },
    { id: "5+", label: "5+" },
];
/* =========================
   PRICES (TYPES)
========================= */

type PetKey = "noPet" | "pet";

export type FinalPrices = Record<
    string, // size
    Record<
        string, // service
        Record<
            string, // people
            Record<PetKey, number>
        >
    >
>;

export type HoursMatrix = Record<
    string, // service
    Record<
        string, // size
        number
    >
>;
/* =========================
   PRICES
========================= */
export const FINAL_PRICES: FinalPrices = {
    "up-to-60": {
        regular: { "1-2": { noPet: 120, pet: 132 }, "3-4": { noPet: 138, pet: 150 }, "5+": { noPet: 144, pet: 156 } },
        initial: { "1-2": { noPet: 165, pet: 181.5 }, "3-4": { noPet: 189.75, pet: 206.25 }, "5+": { noPet: 198, pet: 214.5 } },
        complete:{ "1-2": { noPet: 200, pet: 220 }, "3-4": { noPet: 230, pet: 250 }, "5+": { noPet: 240, pet: 260 } },
        handover:{ "1-2": { noPet: 220, pet: 242 }, "3-4": { noPet: 253, pet: 275 }, "5+": { noPet: 264, pet: 286 } },
    },
    "60-80": {
        regular: { "1-2": { noPet: 145, pet: 159.5 }, "3-4": { noPet: 166.75, pet: 181.25 }, "5+": { noPet: 174, pet: 188.5 } },
        initial: { "1-2": { noPet: 185, pet: 203.5 }, "3-4": { noPet: 212.75, pet: 231.25 }, "5+": { noPet: 222, pet: 240.5 } },
        complete:{ "1-2": { noPet: 245, pet: 269.5 }, "3-4": { noPet: 281.75, pet: 306.25 }, "5+": { noPet: 294, pet: 318.5 } },
        handover:{ "1-2": { noPet: 260, pet: 286 }, "3-4": { noPet: 299, pet: 325 }, "5+": { noPet: 312, pet: 338 } },
    },
    "80-110": {
        regular: { "1-2": { noPet: 190, pet: 209 }, "3-4": { noPet: 218.5, pet: 237.5 }, "5+": { noPet: 228, pet: 247 } },
        initial: { "1-2": { noPet: 230, pet: 253 }, "3-4": { noPet: 264.5, pet: 287.5 }, "5+": { noPet: 276, pet: 299 } },
        complete:{ "1-2": { noPet: 295, pet: 324.5 }, "3-4": { noPet: 339.25, pet: 368.75 }, "5+": { noPet: 354, pet: 383.5 } },
        handover:{ "1-2": { noPet: 315, pet: 346.5 }, "3-4": { noPet: 362.25, pet: 393.75 }, "5+": { noPet: 378, pet: 409.5 } },
    },
    "over-110": {
        regular: { "1-2": { noPet: 235, pet: 258.5 }, "3-4": { noPet: 270.25, pet: 293.75 }, "5+": { noPet: 282, pet: 305.5 } },
        initial: { "1-2": { noPet: 275, pet: 302.5 }, "3-4": { noPet: 316.25, pet: 343.75 }, "5+": { noPet: 330, pet: 357.5 } },
        complete:{ "1-2": { noPet: 345, pet: 379.5 }, "3-4": { noPet: 396.75, pet: 431.25 }, "5+": { noPet: 414, pet: 448.5 } },
        handover:{ "1-2": { noPet: 385, pet: 423.5 }, "3-4": { noPet: 442.75, pet: 481.25 }, "5+": { noPet: 462, pet: 500.5 } },
    },
};
/* =========================
   HOURS
========================= */

export const HOURS_MATRIX: HoursMatrix = {
    regular: { "up-to-60": 2.5, "60-80": 3, "80-110": 4, "over-110": 5 },
    initial: { "up-to-60": 3.5, "60-80": 4, "80-110": 5, "over-110": 6 },
    complete:{ "up-to-60": 4, "60-80": 5, "80-110": 6, "over-110": 7 },
    handover:{ "up-to-60": 4.5, "60-80": 5.5, "80-110": 7, "over-110": 8 },
};
/* =========================
   EXTRAS
========================= */

export const EXTRAS = [
    { id: "linen-single", name: "Linen change - single bed", price: 7.5, hours: 0.13, unit: "bed" },
    { id: "linen-double", name: "Linen change - double bed", price: 14, hours: 0.25, unit: "bed" },
    { id: "oven", name: "Oven deep clean (inside)", price: 100, hours: 2, unit: "unit" },
    { id: "fridge", name: "Fridge deep clean (inside)", price: 50, hours: 1, unit: "unit" },
    { id: "freezer", name: "Freezer deep clean", price: 50, hours: 1, unit: "unit" },
    { id: "windows-inside", name: "Window cleaning - inside", price: 4.25, hours: 0.08, unit: "m² glass" },
    { id: "windows-outside", name: "Window cleaning - outside", price: 4.5, hours: 0.08, unit: "m² glass" },
    { id: "balcony", name: "Balcony / terrace cleaning", price: 52.5, hours: 1, unit: "10 m²" },
    { id: "limescale", name: "Limescale removal - intensive", price: 27, hours: 0.5, unit: "30-min" },
    { id: "cupboards", name: "Cupboards / cabinets - deep clean & organization", price: 50, hours: 1, unit: "hour" },
    { id: "wardrobe", name: "Wardrobe arranging / folding / organization", price: 50, hours: 1, unit: "hour" },
    { id: "sofa", name: "Sofa upholstery vacuuming", price: 6.5, hours: 0.08, unit: "seat" },
];

/* =========================
   TIME
========================= */

export const TIME_SLOTS = Array.from({ length: 40 }, (_, i) => {
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

export const HOLIDAYS = [
    "2025-01-01","2025-01-06","2025-04-18","2025-04-21","2025-05-01","2025-05-29","2025-06-09","2025-06-19","2025-10-03","2025-11-01","2025-12-25","2025-12-26",
    "2026-01-01","2026-01-06","2026-04-03","2026-04-06","2026-05-01","2026-05-14","2026-05-25","2026-06-04","2026-10-03","2026-11-01","2026-12-25","2026-12-26",
];

export const SERVICE_AREAS = [
    "70173","70174","70176","70178","70180","70182","70184","70186","70188","70190",
    "70191","70192","70193","70195","70197","70199","70327","70329","70372","70374",
    "70376","70378","70435","70437","70439","70469","70499","70563","70565","70567",
    "70569","70597","70599",
];
/* =========================
   HELPERS
========================= */

export const getBasePrice = (service: string, size: string, people: string, hasPets: boolean) => {
    const p = FINAL_PRICES[size]?.[service]?.[people];
    return p ? (hasPets ? p.pet : p.noPet) : 0;
};

export const getEstimatedHours = (service: string, size: string) =>
    HOURS_MATRIX[service]?.[size] || 0;