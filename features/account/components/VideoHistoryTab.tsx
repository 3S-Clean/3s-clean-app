"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";
import {CARD_FRAME_ACTION, CARD_FRAME_BASE} from "@/shared/ui";

type VideoHistoryItem = {
    id: string;
    orderId: string;
    videoUid: string;
    status: string;
    title: string | null;
    durationSeconds: number | null;
    sizeBytes: number | null;
    thumbnailUrl: string | null;
    previewUrl: string | null;
    hlsUrl: string | null;
    dashUrl: string | null;
    recordedAt: string | null;
    readyAt: string | null;
    expiresAt: string;
    createdAt: string;
    order: {
        id: string;
        serviceType: string;
        scheduledDate: string;
        scheduledTime: string;
        status: string;
        totalPrice: number | string;
    } | null;
};

type VideoHistoryResponse = {
    configured?: boolean;
    items?: VideoHistoryItem[];
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

function formatShortDateTime(dateIso: string, locale: string) {
    if (!dateIso) return "—";
    const dt = new Date(dateIso);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString(locale === "de" ? "de-DE" : "en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDuration(seconds: number | null) {
    if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "—";
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoHistoryTab() {
    const t = useTranslations("account.content.history");
    const tServices = useTranslations("services");
    const pathname = usePathname();

    const locale = useMemo(() => {
        const first = pathname.split("/")[1];
        return first === "de" ? "de" : "en";
    }, [pathname]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [configured, setConfigured] = useState(false);
    const [items, setItems] = useState<VideoHistoryItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/video/history", {cache: "no-store"});
                const json = (await res.json().catch(() => null)) as VideoHistoryResponse | null;
                if (cancelled) return;
                if (!res.ok) {
                    setError(json?.error || t("errors.loadFailed"));
                    setConfigured(Boolean(json?.configured));
                    setItems([]);
                    return;
                }
                setConfigured(Boolean(json?.configured));
                setItems(Array.isArray(json?.items) ? json.items : []);
            } catch {
                if (!cancelled) {
                    setError(t("errors.loadFailed"));
                    setConfigured(false);
                    setItems([]);
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

                {!loading && !error && configured && items.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">{t("state.empty")}</p>
                ) : null}

                {!loading && !error && configured && items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item) => {
                            const serviceName = item.order?.serviceType
                                ? (tServices.has(`${item.order.serviceType}.title`) ? tServices(`${item.order.serviceType}.title`) : item.order.serviceType)
                                : "—";
                            const playbackUrl = item.hlsUrl || item.previewUrl || item.dashUrl;
                            const title = item.title || serviceName;
                            return (
                                <div key={item.id} className={[CARD_FRAME_ACTION, "p-4"].join(" ")}>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {formatDate(item.order?.scheduledDate ?? "", locale)} • {item.order?.scheduledTime ?? "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {t("meta.duration", {duration: formatDuration(item.durationSeconds)})}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {t("meta.expiresAt", {date: formatShortDateTime(item.expiresAt, locale)})}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {playbackUrl ? (
                                                <a
                                                    href={playbackUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)]"
                                                >
                                                    {t("actions.watch")}
                                                </a>
                                            ) : null}
                                            <Link
                                                href={`/${locale}/account/orders/${item.orderId}`}
                                                className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)]"
                                            >
                                                {t("actions.openOrder")}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
