"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";
import {CARD_FRAME_BASE} from "@/shared/ui";

type LiveApiResponse = {
    configured?: boolean;
    liveSession?: {
        id: string;
        orderId: string;
        liveInputId: string;
        liveInputName: string | null;
        status: string;
        hlsUrl: string | null;
        dashUrl: string | null;
        startedAt: string | null;
        endedAt: string | null;
        updatedAt: string;
        order: {
            id: string;
            serviceType: string;
            scheduledDate: string;
            scheduledTime: string;
            status: string;
        } | null;
    } | null;
    error?: string;
};

function formatDate(dateIsoOrYmd: string, locale: string) {
    if (!dateIsoOrYmd) return "—";
    const normalized = dateIsoOrYmd.includes("T") ? dateIsoOrYmd : `${dateIsoOrYmd}T00:00:00`;
    const dt = new Date(normalized);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function LiveCleaningVideoTab() {
    const t = useTranslations("account.content.live");
    const tServices = useTranslations("services");
    const pathname = usePathname();

    const locale = useMemo(() => {
        const first = pathname.split("/")[1];
        return first === "de" ? "de" : "en";
    }, [pathname]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [configured, setConfigured] = useState(false);
    const [session, setSession] = useState<LiveApiResponse["liveSession"]>(null);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/video/live", {cache: "no-store"});
                const json = (await res.json().catch(() => null)) as LiveApiResponse | null;
                if (cancelled) return;
                if (!res.ok) {
                    setError(json?.error || t("errors.loadFailed"));
                    setConfigured(Boolean(json?.configured));
                    setSession(null);
                    return;
                }
                setConfigured(Boolean(json?.configured));
                setSession(json?.liveSession ?? null);
            } catch {
                if (!cancelled) {
                    setError(t("errors.loadFailed"));
                    setConfigured(false);
                    setSession(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [t]);

    const openUrl = session?.hlsUrl || session?.dashUrl || null;
    const serviceTitle = session?.order?.serviceType
        ? (tServices.has(`${session.order.serviceType}.title`) ? tServices(`${session.order.serviceType}.title`) : session.order.serviceType)
        : "—";

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-[var(--text)] md:text-2xl">{t("title")}</h2>
                <p className="mt-2 text-[var(--muted)]">{t("body")}</p>
            </div>

            <div className={[CARD_FRAME_BASE, "p-5 md:p-6"].join(" ")}>
                {loading ? <p className="text-sm text-[var(--muted)]">{t("loading")}</p> : null}

                {!loading && error ? <p className="text-sm text-[var(--text)]">{error}</p> : null}

                {!loading && !error && !configured ? (
                    <p className="text-sm text-[var(--muted)]">{t("state.notConfigured")}</p>
                ) : null}

                {!loading && !error && configured && !session ? (
                    <p className="text-sm text-[var(--muted)]">{t("state.noSession")}</p>
                ) : null}

                {!loading && !error && configured && session ? (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-[var(--text)]">{serviceTitle}</div>
                                <div className="mt-1 text-sm text-[var(--muted)]">
                                    {formatDate(session.order?.scheduledDate ?? "", locale)} • {session.order?.scheduledTime ?? "—"}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{t("state.statusLabel")}</div>
                                <div className="text-sm font-semibold text-[var(--text)]">{session.status || "—"}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {openUrl ? (
                                <a
                                    href={openUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold text-[var(--text)]"
                                >
                                    {t("actions.openStream")}
                                </a>
                            ) : null}
                            {session.order?.id ? (
                                <Link
                                    href={`/${locale}/account/orders/${session.order.id}`}
                                    className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold text-[var(--text)]"
                                >
                                    {t("actions.openOrder")}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
