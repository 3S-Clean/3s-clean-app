"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {BodyText, CARD_FRAME_ACTION, SectionTitle} from "@/shared/ui";
import {computePaymentDueAt} from "@/shared/lib/orders/lifecycle";

type OrderRow = {
    id: string;
    status: string;
    service_type: string;
    apartment_size: string;
    people_count: string;
    scheduled_date: string;
    scheduled_time: string;
    estimated_hours: number | string;
    total_price: number | string;
    created_at: string;
    payment_due_at?: string | null;
    paid_at?: string | null;
};

function formatDate(d: string, locale: string) {
    const dt = new Date(d + "T00:00:00");
    const intlLocale = locale === "de" ? "de-DE" : "en-GB";
    return dt.toLocaleDateString(intlLocale, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function money(v: number | string) {
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) return "—";
    return `€ ${n.toFixed(2)}`;
}

function hours(v: number | string) {
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) return "—";
    return `~${n}h`;
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

function OrderHistoryEmpty({bookingHref}: { bookingHref: string }) {
    const t = useTranslations("account.orders");
    return (
        <div className="text-center">
            <SectionTitle className="text-xl font-semibold text-[var(--text)] md:text-2xl">
                {t("title")}
            </SectionTitle>
            <BodyText className="mt-4 text-[var(--muted)]">{t("empty.body")}</BodyText>

            <Link
                href={bookingHref}
                className={[
                    "mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition",
                    "bg-gray-900 text-white hover:bg-gray-800",
                    "dark:bg-white dark:text-gray-900 dark:hover:bg-white/90",
                ].join(" ")}
            >
                {t("empty.cta")}
            </Link>
        </div>
    );
}

export default function OrdersTabClient() {
    const t = useTranslations("account.orders");
    const tServices = useTranslations("services");
    const pathname = usePathname();

    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);
    const localeSafe = hasLocale ? locale : "en";

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busyCancelId, setBusyCancelId] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(Date.now());

    const canCancel = (status: string) => {
        const key = statusKey(status);
        return key === "reserved" || key === "awaiting_payment" || key === "payment_pending" || key === "paid";
    };

    const paymentSecondsLeft = (order: OrderRow) => {
        if (statusKey(order.status) !== "reserved") return null;
        if (typeof order.paid_at === "string" && order.paid_at.trim().length > 0) return null;
        const dueIso = computePaymentDueAt(order);
        if (!dueIso) return null;
        const dueMs = Date.parse(dueIso);
        if (Number.isNaN(dueMs)) return null;
        return Math.max(0, Math.floor((dueMs - nowMs) / 1000));
    };

    useEffect(() => {
        const hasPendingTimer = orders.some((o) => {
            if (statusKey(o.status) !== "reserved") return false;
            return !(typeof o.paid_at === "string" && o.paid_at.trim().length > 0);
        });
        if (!hasPendingTimer) return;
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [orders]);

    const cancelOrder = async (orderId: string) => {
        if (busyCancelId) return;
        if (!window.confirm(t("actions.cancelConfirm"))) return;

        setBusyCancelId(orderId);
        try {
            const res = await fetch("/api/booking/cancel-order", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({orderId}),
            });
            const json = (await res.json().catch(() => null)) as {error?: string} | null;
            if (!res.ok) {
                window.alert(json?.error || t("actions.cancelFailed"));
                return;
            }
            setOrders((prev) => prev.map((o) => (o.id === orderId ? {...o, status: "cancelled"} : o)));
        } catch {
            window.alert(t("actions.cancelFailed"));
        } finally {
            setBusyCancelId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/booking/my-orders", {
                    method: "GET",
                    cache: "no-store",
                });
                const json = (await res.json().catch(() => null)) as {
                    orders?: OrderRow[];
                    error?: string;
                } | null;

                if (cancelled) return;

                if (!res.ok) {
                    if (res.status === 401) {
                        setError(t("errors.notAuthenticated"));
                    } else {
                        setError(json?.error || t("errors.loadFailed"));
                    }
                    setOrders([]);
                    return;
                }

                setOrders(Array.isArray(json?.orders) ? json.orders : []);
            } catch {
                if (!cancelled) {
                    setError(t("errors.loadFailed"));
                    setOrders([]);
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

    if (loading) {
        return (
            <div className="text-center">
                <SectionTitle className="text-xl font-semibold text-[var(--text)] md:text-2xl">
                    {t("title")}
                </SectionTitle>
                <BodyText className="mt-4 text-[var(--muted)]">{t("loading")}</BodyText>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <SectionTitle className="text-xl font-semibold text-[var(--text)] md:text-2xl">
                    {t("title")}
                </SectionTitle>
                <BodyText className="mt-4 text-[var(--muted)]">{error}</BodyText>
            </div>
        );
    }

    if (orders.length === 0) {
        return <OrderHistoryEmpty bookingHref={withLocale("/booking")}/>;
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <SectionTitle className="text-xl font-semibold text-[var(--text)] md:text-2xl">
                        {t("title")}
                    </SectionTitle>
                    <BodyText className="mt-1 text-[var(--muted)]">{t("subtitle")}</BodyText>
                </div>
            </div>

            <div className="space-y-5">
                {orders.map((o) => (
                    <div
                        key={o.id}
                        className={[CARD_FRAME_ACTION, "block p-6"].join(" ")}
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <div className="text-lg font-semibold capitalize text-[color:var(--text)]">
                                    {tServices.has(`${o.service_type}.title`) ? tServices(`${o.service_type}.title`) : o.service_type}
                                </div>

                                <div className="mt-2 text-sm text-[color:var(--muted)]">
                                    {formatDate(o.scheduled_date, localeSafe)} • {o.scheduled_time} • {hours(o.estimated_hours)}
                                </div>

                                <div className="mt-1 text-sm text-[color:var(--muted)]">
                                    {o.apartment_size} • {o.people_count} {t("meta.people")}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                    <Link
                                        href={withLocale(`/account/orders/${o.id}`)}
                                        className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)]"
                                    >
                                        {t("actions.viewDetails")}
                                    </Link>
                                    {canCancel(o.status) ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void cancelOrder(o.id);
                                            }}
                                            disabled={busyCancelId === o.id}
                                            className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {busyCancelId === o.id ? t("actions.cancelling") : t("actions.cancelOrder")}
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="text-xl font-semibold text-[color:var(--text)]">{money(o.total_price)}</div>
                                <div className="mt-1 text-sm text-[color:var(--muted)]">
                                    {t(`status.${statusKey(o.status)}`)}
                                </div>
                                {paymentSecondsLeft(o) !== null ? (
                                    <div className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                        {t("actions.paymentDueIn", {time: formatCountdown(paymentSecondsLeft(o) ?? 0)})}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
