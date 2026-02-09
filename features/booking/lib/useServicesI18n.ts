"use client";

import {useTranslations} from "next-intl";
import type {ServiceId, ServiceIncludeKey} from "@/features/booking/lib/config";

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

    const getIncludeText = (serviceId: ServiceId, key: ServiceIncludeKey) => {
        const raw = tIncludes.raw(key) as
            | (Partial<Record<ServiceId, IncludeRaw>> & { core?: IncludeRaw })
            | undefined;

        const picked = raw?.[serviceId] ?? raw?.core;

        return {
            name: picked?.name ?? "",
            desc:
                typeof picked?.desc === "string" && picked.desc.trim()
                    ? picked.desc
                    : undefined,
        };
    };

    return {getServiceText, getIncludeText};
}