// lib/services/useServicesI18n.ts
"use client";

import { useTranslations } from "next-intl";
import type { ServiceConfig, ServiceIncludeKey, ServiceId } from "@/lib/booking/config";

export function useServicesI18n() {
    const t = useTranslations();

    const serviceText = (service: ServiceConfig) => ({
        title: t(service.titleKey),
        desc: t(service.descKey),
        includesLabel: service.baseFeaturesKey ? t(service.baseFeaturesKey) : t("experiencePage.cards.includesFallback"),
    });

    const includeText = (key: ServiceIncludeKey) => ({
        name: t(`services.includes.${key}.name`),
        desc: t(`services.includes.${key}.desc`), // может быть пустой строкой
    });

    return { serviceText, includeText };
}