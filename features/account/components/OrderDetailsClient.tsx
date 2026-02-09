"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {
    APARTMENT_SIZES,
    type ServiceId,
    type ServiceIncludeKey,
    SERVICES,
} from "@/features/booking/lib/config";
import {
    computePaymentDueAt,
    isAwaitingPaymentStatus,
    normalizeDisplayStatus,
} from "@/shared/lib/orders/lifecycle";
import {CARD_FRAME_BASE} from "@/shared/ui";

type Props = {
    orderId: string;
    locale: "en" | "de";
};

type ApiOrder = {
    id: string;
    status: string;
    payment_due_at?: string | null;
    paid_at?: string | null;
    service_type: string;
    apartment_size: string;
    people_count: string;
    has_pets?: boolean | null;
    has_kids?: boolean | null;
    has_allergies?: boolean | null;
    allergy_note?: string | null;
    extras?: unknown;
    base_price?: number | string | null;
    extras_price?: number | string | null;
    total_price: number | string;
    estimated_hours: number | string;
    customer_first_name?: string | null;
    customer_last_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_address?: string | null;
    customer_postal_code?: string | null;
    customer_city?: string | null;
    customer_country?: string | null;
    customer_notes?: string | null;
    scheduled_date: string;
    scheduled_time: string;
    created_at: string | null;
    [key: string]: unknown;
};

type IncludeRaw = {
    name: string;
    desc?: string;
};

type OrderExtraLine = {
    id: string;
    name: string;
    quantity: number;
    price: number;
};

function toNumber(v: unknown, fallback = 0) {
    const n = typeof v === "string" ? Number(v) : (v as number);
    return Number.isFinite(n) ? n : fallback;
}

function formatMoney(v: unknown) {
    const n = toNumber(v, NaN);
    if (!Number.isFinite(n)) return "—";
    return `€ ${n.toFixed(2)}`;
}

function formatHours(v: unknown) {
    const n = toNumber(v, NaN);
    if (!Number.isFinite(n)) return "—";
    const totalMinutes = Math.max(0, Math.round(n * 60));
    const wh = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (wh === 0) return `~${m}min`;
    if (m === 0) return `~${wh}h`;
    return `~${wh}h ${m}min`;
}

function formatApartmentSize(v: unknown) {
    const raw = String(v ?? "").trim();
    if (!raw) return "—";

    const mapped = APARTMENT_SIZES.find((s) => s.id === raw)?.label;
    if (mapped) return mapped;
    if (raw.toLowerCase().includes("m²")) return raw;

    const compact = raw.replace(/\s+/g, "");
    const range = compact.match(/^(\d+)[-–](\d+)$/);
    if (range) return `${range[1]}–${range[2]} m²`;

    const upTo = compact.match(/^up[-_]?to[-_]?(\d+)$/i);
    if (upTo) return `< ${upTo[1]} m²`;

    const over = compact.match(/^over[-_]?(\d+)$/i);
    if (over) return `> ${over[1]} m²`;

    return raw;
}

function parseExtras(input: unknown): OrderExtraLine[] {
    if (!Array.isArray(input)) return [];
    return input
        .map((raw) => {
            if (!raw || typeof raw !== "object") return null;
            const r = raw as Record<string, unknown>;
            const id = String(r.id ?? "").trim();
            const name = String(r.name ?? "").trim();
            const quantity = Math.max(0, Math.round(toNumber(r.quantity, 0)));
            const price = toNumber(r.price, 0);
            if (!id || quantity <= 0) return null;
            return {
                id,
                name,
                quantity,
                price,
            };
        })
        .filter((v): v is OrderExtraLine => !!v);
}

function formatCountdown(totalSec: number) {
    const s = Math.max(0, totalSec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function statusKey(s: string) {
    switch (s) {
        case "reserved":
            return "reserved";
        case "awaiting_payment":
            return "awaiting_payment";
        case "payment_pending":
            return "payment_pending";
        case "expired":
            return "expired";
        case "pending":
            return "awaiting_payment";
        case "confirmed":
            return "reserved";
        case "paid":
            return "paid";
        case "in_progress":
            return "in_progress";
        case "completed":
            return "completed";
        case "cancelled":
            return "cancelled";
        case "refunded":
            return "refunded";
        default:
            return "unknown";
    }
}

export default function OrderDetailsClient({orderId, locale}: Props) {
    const t = useTranslations("account.orderDetails");
    const tOrderStatus = useTranslations("account.orders.status");
    const tServices = useTranslations("services");
    const tIncludes = useTranslations("servicesIncludes");
    const tExtras = useTranslations("extras");

    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyCancel, setBusyCancel] = useState(false);
    const [busyPdf, setBusyPdf] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const didRefetchAfterExpiry = useRef(false);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/booking/get-order", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({orderId}),
                cache: "no-store",
            });
            const json = (await res.json().catch(() => null)) as {order?: ApiOrder; error?: string} | null;

            if (!res.ok) {
                setOrder(null);
                setError(json?.error || t("errors.loadFailed"));
                return;
            }

            if (!json?.order) {
                setOrder(null);
                setError(t("errors.notFound"));
                return;
            }

            setOrder(json.order);
        } catch {
            setOrder(null);
            setError(t("errors.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [orderId, t]);

    useEffect(() => {
        void fetchOrder();
    }, [fetchOrder]);

    const displayStatus = useMemo(() => {
        if (!order) return "unknown";
        return normalizeDisplayStatus(order, nowMs);
    }, [order, nowMs]);

    const scheduleSectionTitle = useMemo(() => {
        const base = t("sections.schedule");
        const statusLabel = tOrderStatus(statusKey(displayStatus));
        if (!statusLabel || statusLabel === "—") return base;
        return `${base} · ${statusLabel}`;
    }, [displayStatus, t, tOrderStatus]);

    useEffect(() => {
        if (!order) return;
        const hasPaidAt = typeof order.paid_at === "string" && order.paid_at.trim().length > 0;
        const isPaymentWindow = isAwaitingPaymentStatus(order.status) || normalizeDisplayStatus(order, Date.now()) === "reserved";
        if (!isPaymentWindow || hasPaidAt) return;

        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [order]);

    const paymentDueAt = useMemo(() => (order ? computePaymentDueAt(order) : null), [order]);
    const remainingSeconds = useMemo(() => {
        if (!order) return null;
        const hasPaidAt = typeof order.paid_at === "string" && order.paid_at.trim().length > 0;
        if (hasPaidAt) return null;
        if (displayStatus !== "reserved" && !isAwaitingPaymentStatus(order.status)) return null;
        if (!paymentDueAt) return null;
        const dueMs = Date.parse(paymentDueAt);
        if (Number.isNaN(dueMs)) return null;
        return Math.max(0, Math.floor((dueMs - nowMs) / 1000));
    }, [displayStatus, order, paymentDueAt, nowMs]);

    useEffect(() => {
        if (remainingSeconds === null) return;
        if (remainingSeconds > 0) return;
        if (didRefetchAfterExpiry.current) return;
        didRefetchAfterExpiry.current = true;
        void fetchOrder();
    }, [remainingSeconds, fetchOrder]);

    const serviceId = useMemo(() => {
        if (!order?.service_type) return null;
        const maybe = SERVICES.find((s) => s.id === order.service_type);
        return maybe?.id ?? null;
    }, [order?.service_type]);

    const serviceTitle = useMemo(() => {
        if (!serviceId) return order?.service_type || "—";
        return tServices(`${serviceId}.title`);
    }, [order?.service_type, serviceId, tServices]);

    const includes = useMemo(() => {
        if (!serviceId) return [];
        const config = SERVICES.find((s) => s.id === serviceId);
        if (!config) return [];
        return config.includesKeys
            .map((key) => {
                const raw = tIncludes.raw(key) as
                    | (Partial<Record<ServiceId, IncludeRaw>> & { core?: IncludeRaw })
                    | undefined;
                const picked = raw?.[serviceId] ?? raw?.core;
                if (!picked?.name) return null;
                return {
                    key,
                    name: picked.name,
                    desc: typeof picked.desc === "string" && picked.desc.trim() ? picked.desc : null,
                };
            })
            .filter((v): v is { key: ServiceIncludeKey; name: string; desc: string | null } => !!v);
    }, [serviceId, tIncludes]);

    const extras = useMemo(() => {
        const rows = parseExtras(order?.extras);
        return rows.map((row) => {
            const key = `${row.id}.name`;
            const fallbackName = tExtras.has(key) ? tExtras(key) : row.id;
            return {
                ...row,
                displayName: row.name || fallbackName || row.id,
            };
        });
    }, [order?.extras, tExtras]);

    const canCancel = useMemo(() => {
        return displayStatus === "awaiting_payment"
            || displayStatus === "payment_pending"
            || displayStatus === "reserved"
            || displayStatus === "paid";
    }, [displayStatus]);

    const handleCancelOrder = async () => {
        if (!order || !canCancel || busyCancel) return;
        const yes = window.confirm(t("cancel.confirmPrompt"));
        if (!yes) return;

        setBusyCancel(true);
        setActionMessage(null);
        try {
            const res = await fetch("/api/booking/cancel-order", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({orderId: order.id}),
            });
            const json = (await res.json().catch(() => null)) as {error?: string} | null;
            if (!res.ok) {
                setActionMessage(json?.error || t("cancel.failed"));
                return;
            }
            setActionMessage(t("cancel.success"));
            await fetchOrder();
        } catch {
            setActionMessage(t("cancel.failed"));
        } finally {
            setBusyCancel(false);
        }
    };

    const handlePdf = async () => {
        if (!order || busyPdf) return;
        if (typeof order.pdf_download_url === "string" && order.pdf_download_url.trim()) {
            window.open(order.pdf_download_url, "_blank", "noopener,noreferrer");
            return;
        }

        setBusyPdf(true);
        try {
            const res = await fetch("/api/booking/order-pdf-data", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({orderId: order.id}),
            });
            const json = (await res.json().catch(() => null)) as {message?: string} | null;
            setActionMessage(json?.message || t("pdf.notReady"));
        } catch {
            setActionMessage(t("pdf.notReady"));
        } finally {
            setBusyPdf(false);
        }
    };

    const fullName = [order?.customer_first_name, order?.customer_last_name].filter(Boolean).join(" ");
    const dateLabel = order
        ? new Date(order.scheduled_date + "T00:00:00").toLocaleDateString(
            locale === "de" ? "de-DE" : "en-GB",
            {weekday: "long", day: "2-digit", month: "long", year: "numeric"}
        )
        : "";

    if (loading) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8 space-y-6">
                <div className={[CARD_FRAME_BASE, "p-7"].join(" ")}>{t("loading")}</div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8 space-y-6">
                <div className={[CARD_FRAME_BASE, "p-7"].join(" ")}>
                    <p className="text-[var(--text)]">{error || t("errors.notFound")}</p>
                    <Link
                        href={`/${locale}/account`}
                        className="mt-5 inline-flex rounded-full px-5 py-2.5 border border-black/10 dark:border-white/15"
                    >
                        {t("actions.backToOrders")}
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8 space-y-6">
            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--text)]">{t("title")}</h1>
                        <p className="mt-1 text-[var(--muted)]">{t("subtitle", {orderId: order.id.slice(0, 8)})}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-semibold text-[var(--text)]">{formatMoney(order.total_price)}</div>
                        <div className="mt-1 text-sm text-[var(--muted)]">
                            {tOrderStatus(statusKey(displayStatus))}
                        </div>
                        {remainingSeconds !== null ? (
                            <div className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                {t("payment.dueIn", {time: formatCountdown(remainingSeconds)})}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">{scheduleSectionTitle}</h2>
                <div className="grid gap-2 text-sm text-[var(--muted)]">
                    <div>{serviceTitle}</div>
                    <div>{dateLabel} • {order.scheduled_time} • {formatHours(order.estimated_hours)}</div>
                    <div>{formatApartmentSize(order.apartment_size)} • {order.people_count} {t("meta.people")}</div>
                </div>
            </div>

            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">{t("sections.included")}</h2>
                <ul className="space-y-3">
                    {includes.map((item) => (
                        <li key={item.key} className="text-sm text-[var(--text)]">
                            <div className="font-medium">{item.name}</div>
                            {item.desc ? <div className="text-[var(--muted)]">{item.desc}</div> : null}
                        </li>
                    ))}
                    {includes.length === 0 ? (
                        <li className="text-sm text-[var(--muted)]">{t("sections.noIncluded")}</li>
                    ) : null}
                </ul>
            </div>

            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">{t("sections.extras")}</h2>
                {extras.length > 0 ? (
                    <ul className="space-y-2">
                        {extras.map((e) => (
                            <li key={`${e.id}-${e.quantity}`} className="flex items-start justify-between gap-4 text-sm">
                                <span className="text-[var(--text)]">{e.quantity}x {e.displayName}</span>
                                <span className="text-[var(--muted)]">{formatMoney(e.price)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-[var(--muted)]">{t("sections.noExtras")}</p>
                )}

                <div className="mt-5 border-t border-black/8 dark:border-white/12 pt-4 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">{t("price.base")}</span>
                        <span className="text-[var(--text)]">{formatMoney(order.base_price)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">{t("price.extras")}</span>
                        <span className="text-[var(--text)]">{formatMoney(order.extras_price)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span className="text-[var(--text)]">{t("price.total")}</span>
                        <span className="text-[var(--text)]">{formatMoney(order.total_price)}</span>
                    </div>
                </div>
            </div>

            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">{t("sections.contact")}</h2>
                <div className="grid gap-2 text-sm">
                    <div className="text-[var(--text)]">{fullName || "—"}</div>
                    <div className="text-[var(--muted)]">{order.customer_email || "—"}</div>
                    <div className="text-[var(--muted)]">{order.customer_phone || "—"}</div>
                    <div className="text-[var(--muted)]">
                        {[order.customer_address, [order.customer_postal_code, order.customer_city].filter(Boolean).join(" "), order.customer_country]
                            .filter((v) => typeof v === "string" && v.trim()).join(", ") || "—"}
                    </div>
                    {order.has_allergies ? (
                        <div className="text-[var(--text)]">
                            {t("contact.allergies")}: {order.allergy_note || "—"}
                        </div>
                    ) : null}
                    {order.customer_notes ? (
                        <div className="text-[var(--text)]">
                            {t("contact.notes")}: {order.customer_notes}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className={[CARD_FRAME_BASE, "p-6 md:p-7"].join(" ")}>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={!canCancel || busyCancel}
                        className={[
                            "px-5 py-2.5 rounded-full font-medium transition-all",
                            "bg-white/45 backdrop-blur-md text-gray-900 border border-black/6",
                            "hover:border-red-600/70 hover:bg-red-600 hover:text-white",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            "dark:bg-[var(--card)]/40 dark:text-white dark:border-white/12",
                            "dark:hover:border-red-500 dark:hover:bg-red-600 dark:hover:text-white",
                        ].join(" ")}
                    >
                        {busyCancel ? t("cancel.processing") : t("actions.cancelOrder")}
                    </button>

                    <button
                        type="button"
                        onClick={handlePdf}
                        disabled={busyPdf}
                        className={[
                            "px-5 py-2.5 rounded-full font-medium transition-all",
                            "bg-white/45 backdrop-blur-md text-gray-900 border border-black/6",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            "dark:bg-[var(--card)]/40 dark:text-white dark:border-white/12",
                        ].join(" ")}
                    >
                        {busyPdf ? t("pdf.preparing") : t("actions.downloadPdf")}
                    </button>

                </div>

                <p className="mt-4 text-xs text-[var(--muted)]">{t("cancel.policyHint")}</p>
                {actionMessage ? <p className="mt-2 text-sm text-[var(--text)]">{actionMessage}</p> : null}
            </div>
        </main>
    );
}
