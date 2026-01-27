"use client";

import { useTranslations } from "next-intl";
import type { ServiceIncludeKey, ServiceId } from "@/lib/booking/config";

type IncludeRaw = {
    name: string;
    desc?: string;
};

export function useServicesI18n() {
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");

    const getServiceText = (id: ServiceId) => ({
        title: tServices(`${id}.title`),
        desc: tServices(`${id}.desc`),
    });

    const getIncludeText = (key: ServiceIncludeKey) => {
        const raw = tIncludes.raw(key) as IncludeRaw | undefined;

        return {
            name: raw?.name ?? "",
            desc:
                typeof raw?.desc === "string" && raw.desc.trim()
                    ? raw.desc
                    : undefined,
        };
    };

    return { getServiceText, getIncludeText };
}