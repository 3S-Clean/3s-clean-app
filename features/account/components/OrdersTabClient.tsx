"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {createClient} from "@/shared/lib/supabase/client";
import SectionTitle from "@/shared/ui/typography/SectionTitle";
import BodyText from "@/shared/ui/typography/BodyText";
import {CARD_FRAME_ACTION, CARD_FRAME_STATIC} from "@/shared/ui/card/CardFrame";

type OrderRow = {
    id: string;
    status: string;
    service_type: string;
    apartment_size: string;
    people_count: string;
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number | string;
    total_price: number | string;
    created_at: string;
};

function formatDate(d: string, locale: string) {
    const dt = new Date(d + "T00:00:00");

    // next-intl locale: "en" | "de" → for Intl use "en-GB" or "de-DE"
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

function statusKey(s: string) {
    switch (s) {
        case "pending":
            return "pending";
        case "confirmed":
            return "confirmed";
        case "in_progress":
            return "in_progress";
        case "completed":
            return "completed";
        case "cancelled":
            return "cancelled";
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
    const supabase = useMemo(() => createClient(), []);
    const t = useTranslations("account.orders");
    const pathname = usePathname();

    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);
    const localeSafe = hasLocale ? locale : "en";

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const {data: u, error: uErr} = await supabase.auth.getUser();
                if (uErr || !u?.user) {
                    if (!cancelled) setError(t("errors.notAuthenticated"));
                    if (!cancelled) setOrders([]);
                    return;
                }

                const {data, error} = await supabase
                    .from("orders")
                    .select(
                        "id,status,service_type,apartment_size,people_count,scheduled_date,scheduled_time,estimated_hours,total_price,created_at"
                    )
                    .eq("user_id", u.user.id)
                    .order("scheduled_date", {ascending: true})
                    .order("scheduled_time", {ascending: true});

                if (cancelled) return;

                if (error) {
                    setError(t("errors.loadFailed"));
                    setOrders([]);
                    return;
                }

                setOrders((data ?? []) as OrderRow[]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [supabase, t]);

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
                    <Link
                        key={o.id}
                        href={withLocale(`/account/orders/${o.id}`)}
                        className={[CARD_FRAME_ACTION, "block p-6"].join(" ")}
                    >
                        <div className="flex items-start justify-between gap-6">
                            {/* LEFT */}
                            <div>
                                <div className="text-lg font-semibold capitalize text-[color:var(--text)]">
                                    {o.service_type}
                                </div>

                                <div className="mt-2 text-sm text-[color:var(--muted)]">
                                    {formatDate(o.scheduled_date, localeSafe)} • {o.scheduled_time} • {hours(o.estimated_hours)}
                                </div>

                                <div className="mt-1 text-sm text-[color:var(--muted)]">
                                    {o.apartment_size} • {o.people_count} {t("meta.people")}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="text-right shrink-0">
                                <div
                                    className="text-xl font-semibold text-[color:var(--text)]">{money(o.total_price)}</div>
                                <div className="mt-1 text-sm text-[color:var(--muted)]">
                                    {t(`status.${statusKey(o.status)}`)}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {/* пример обычной НЕкликабельной карточки (если понадобится позже) */}
            <div className="mt-6 hidden">
                <div className={[CARD_FRAME_STATIC, "p-6"].join(" ")}>...</div>
            </div>
        </div>
    );
}