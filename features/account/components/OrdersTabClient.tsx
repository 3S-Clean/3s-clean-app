"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {BodyText, CARD_FRAME_ACTION, SectionTitle} from "@/shared/ui";
import {computePaymentDueAt} from "@/shared/lib/orders/lifecycle";
import {APARTMENT_SIZES, roundMinutesToQuarterUp} from "@/features/booking/lib/config";

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

type FilterKey = "all" | "active" | "needsAction" | "past";

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
    const totalMinutes = roundMinutesToQuarterUp(n * 60);
    const wh = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (wh === 0) return `~${m}min`;
    if (m === 0) return `~${wh}h`;
    return `~${wh}h ${m}min`;
}

function apartmentSizeLabel(v: string) {
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

function hasPaid(order: OrderRow) {
    if (typeof order.paid_at === "string" && order.paid_at.trim().length > 0) return true;
    const key = statusKey(order.status);
    return key === "paid" || key === "in_progress" || key === "completed" || key === "refunded";
}

function needsAction(order: OrderRow) {
    const key = statusKey(order.status);
    if (key === "awaiting_payment" || key === "payment_pending") return true;
    return key === "reserved" && !hasPaid(order);
}

function isPast(order: OrderRow) {
    const key = statusKey(order.status);
    return key === "cancelled" || key === "completed" || key === "refunded" || key === "expired";
}

function isActive(order: OrderRow) {
    if (needsAction(order)) return true;
    const key = statusKey(order.status);
    return key === "reserved" || key === "paid" || key === "in_progress";
}

function orderTimeMs(order: OrderRow) {
    const direct = Date.parse(`${order.scheduled_date}T${order.scheduled_time || "00:00"}:00`);
    if (!Number.isNaN(direct)) return direct;
    const created = Date.parse(order.created_at);
    return Number.isNaN(created) ? 0 : created;
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
    const [filter, setFilter] = useState<FilterKey>("all");

    const canCancel = (status: string) => {
        const key = statusKey(status);
        return key === "reserved" || key === "awaiting_payment" || key === "payment_pending" || key === "paid";
    };

    const paymentSecondsLeft = (order: OrderRow) => {
        if (!needsAction(order)) return null;
        const dueIso = computePaymentDueAt(order);
        if (!dueIso) return null;
        const dueMs = Date.parse(dueIso);
        if (Number.isNaN(dueMs)) return null;
        return Math.max(0, Math.floor((dueMs - nowMs) / 1000));
    };

    useEffect(() => {
        const hasPendingTimer = orders.some((o) => needsAction(o));
        if (!hasPendingTimer) return;
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [orders]);

    const sortedOrders = useMemo(() => {
        const rank = (order: OrderRow) => {
            if (needsAction(order)) return 0;
            if (isActive(order)) return 1;
            if (isPast(order)) return 2;
            return 3;
        };

        return [...orders].sort((a, b) => {
            const ra = rank(a);
            const rb = rank(b);
            if (ra !== rb) return ra - rb;

            const ta = orderTimeMs(a);
            const tb = orderTimeMs(b);

            if (ra === 2) return tb - ta;
            return ta - tb;
        });
    }, [orders]);

    const counts = useMemo(
        () => ({
            all: sortedOrders.length,
            active: sortedOrders.filter((o) => isActive(o)).length,
            needsAction: sortedOrders.filter((o) => needsAction(o)).length,
            past: sortedOrders.filter((o) => isPast(o)).length,
        }),
        [sortedOrders]
    );

    const filteredOrders = useMemo(() => {
        switch (filter) {
            case "active":
                return sortedOrders.filter((o) => isActive(o));
            case "needsAction":
                return sortedOrders.filter((o) => needsAction(o));
            case "past":
                return sortedOrders.filter((o) => isPast(o));
            default:
                return sortedOrders;
        }
    }, [filter, sortedOrders]);

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

    const statusToneClass = (order: OrderRow) => {
        const key = statusKey(order.status);
        if (key === "cancelled" || key === "expired" || key === "refunded") {
            return "text-red-600 dark:text-red-300";
        }
        if (key === "completed") {
            return "text-emerald-700 dark:text-emerald-300";
        }
        if (needsAction(order)) {
            return "text-amber-700 dark:text-amber-300";
        }
        return "text-[color:var(--muted)]";
    };

    const primaryActionLabel = (order: OrderRow) => {
        if (needsAction(order)) return t("actions.payNow");
        if (isPast(order)) return t("actions.viewSummary");
        return t("actions.manageOrder");
    };

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

            <div className="mb-6 flex flex-wrap gap-2">
                {(
                    [
                        {id: "all", label: t("filters.all"), count: counts.all},
                        {id: "active", label: t("filters.active"), count: counts.active},
                        {id: "needsAction", label: t("filters.needsAction"), count: counts.needsAction},
                        {id: "past", label: t("filters.past"), count: counts.past},
                    ] as Array<{id: FilterKey; label: string; count: number}>
                ).map((item) => {
                    const active = filter === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilter(item.id)}
                            className={[
                                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                                active
                                    ? "bg-gray-900 text-white border border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                                    : "border border-black/10 dark:border-white/15 text-[var(--text)] hover:bg-[var(--text)]/5",
                            ].join(" ")}
                        >
                            <span>{item.label}</span>
                            <span
                                className={[
                                    "inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-[10px]",
                                    active
                                        ? "bg-white/20 text-white dark:bg-black/15 dark:text-gray-900"
                                        : "bg-black/5 text-[var(--muted)] dark:bg-white/10",
                                ].join(" ")}
                            >
                                {item.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-black/8 dark:border-white/12 p-4">
                    <BodyText className="text-[var(--muted)]">{t("empty.filtered")}</BodyText>
                    {filter !== "all" ? (
                        <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className="mt-3 inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)]"
                        >
                            {t("actions.showAll")}
                        </button>
                    ) : null}
                </div>
            ) : null}

            <div className="space-y-5">
                {filteredOrders.map((o) => (
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
                                    {apartmentSizeLabel(o.apartment_size)} • {o.people_count} {t("meta.people")}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                    <Link
                                        href={withLocale(`/account/orders/${o.id}`)}
                                        className={[
                                            "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                                            needsAction(o)
                                                ? "bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:border-white"
                                                : "border border-black/10 dark:border-white/15 text-[var(--text)] hover:bg-[var(--text)]/5",
                                        ].join(" ")}
                                    >
                                        {primaryActionLabel(o)}
                                    </Link>
                                    {canCancel(o.status) ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void cancelOrder(o.id);
                                            }}
                                            disabled={busyCancelId === o.id}
                                            className={[
                                                "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                                                "border border-black/10 text-[var(--text)]",
                                                "hover:border-red-600/70 hover:bg-red-600 hover:text-white",
                                                "dark:border-white/15 dark:hover:border-red-500 dark:hover:bg-red-600 dark:hover:text-white",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                            ].join(" ")}
                                        >
                                            {busyCancelId === o.id ? t("actions.cancelling") : t("actions.cancelOrder")}
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="text-xl font-semibold text-[color:var(--text)]">{money(o.total_price)}</div>
                                <div className={["mt-1 text-sm", statusToneClass(o)].join(" ")}>
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
