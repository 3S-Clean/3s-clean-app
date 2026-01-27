"use client";

import { useTranslations } from "next-intl";
import type { ExtraId } from "@/lib/booking/config";

export function useExtrasI18n() {
    const t = useTranslations("extras");

    const getExtraText = (id: ExtraId) => ({
        name: t(`${id}.name`),
        unit: t(`${id}.unit`),
    });

    return { getExtraText };
}