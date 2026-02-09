import {
    type ApartmentSizeId,
    type ExtraId,
    EXTRAS,
    type PeopleCountId,
    SERVICE_AREAS,
    type ServiceId,
} from "@/features/booking/lib/config";

// ---------- unions ----------
export function isServiceId(v: unknown): v is ServiceId {
    return v === "core" || v === "reset" || v === "initial" || v === "handover";
}

export function isApartmentSizeId(v: unknown): v is ApartmentSizeId {
    return v === "up-to-60" || v === "60-100" || v === "100-140" || v === "over-140";
}

export function isPeopleCountId(v: unknown): v is PeopleCountId {
    return v === "1-2" || v === "3-4" || v === "5+";
}

// ---------- extras ----------
const EXTRA_IDS = new Set<ExtraId>(EXTRAS.map((e) => e.id));

export function isExtraId(v: unknown): v is ExtraId {
    return typeof v === "string" && EXTRA_IDS.has(v as ExtraId);
}

// ---------- service areas ----------
const SERVICE_AREA_SET = new Set<string>(SERVICE_AREAS);

export function normalizePostcode(v: unknown): string {
    return String(v ?? "").replace(/\D/g, "").slice(0, 5);
}

export function isServiceAreaPostcode(postcode: unknown): boolean {
    const plz = normalizePostcode(postcode);
    return plz.length === 5 && SERVICE_AREA_SET.has(plz);
}