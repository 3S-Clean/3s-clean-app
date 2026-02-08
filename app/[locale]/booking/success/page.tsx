"use client";

import {Suspense, useEffect, useMemo, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {useBookingStore} from "@/lib/booking/store";
import {SERVICES} from "@/lib/booking/config";
import {Check} from "lucide-react";
import {createClient} from "@/lib/supabase/client";
import {useTranslations} from "next-intl";

type Order = {
    id: string;
    service_type: string;
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number;
    total_price: number | string;
    status: string;

    customer_first_name?: string | null;
    customer_last_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_address?: string | null;
    customer_postal_code?: string | null;
    customer_city?: string | null;
    customer_country?: string | null;
    customer_notes?: string | null;
};

function Content() {
    const t = useTranslations("bookingSuccess");
    const sp = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const seg = pathname.split("/")[1];
    const locale = seg === "en" || seg === "de" ? seg : "en";
    const href = `/${locale}/account`;

    const supabase = useMemo(() => createClient(), []);

    // ✅ support both formats
    const orderId = sp.get("orderId") || "";
    const pendingToken = sp.get("pendingToken") || sp.get("pendingOrder") || "";

    // ✅ priority: orderId > pendingToken
    const query = useMemo(() => {
        if (orderId) return {orderId};
        if (pendingToken) return {pendingToken};
        return null;
    }, [orderId, pendingToken]);

    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

    const {resetBooking} = useBookingStore();

    useEffect(() => {
        resetBooking();
    }, [resetBooking]);

    // ✅ check auth
    useEffect(() => {
        let cancelled = false;
        supabase.auth.getUser().then(({data}) => {
            if (!cancelled) setIsAuthed(!!data.user);
        });
        return () => {
            cancelled = true;
        };
    }, [supabase]);

    useEffect(() => {
        if (!query) {
            setError(t("errors.missingRef"));
            setOrder(null);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/booking/get-order-public", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(query),
                    signal: controller.signal,
                });

                const json = (await res.json().catch(() => null)) as null | {
                    order?: Order;
                    error?: string;
                };

                if (!res.ok) {
                    setError(json?.error || t("errors.loadFailed"));
                    setOrder(null);
                    return;
                }

                setOrder(json?.order ?? null);
                if (!json?.order) setError(t("errors.notFound"));
            } catch (e: unknown) {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setError(t("errors.loadFailed"));
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        void run();
        return () => controller.abort();
    }, [query, t]);

    const service = order ? SERVICES.find((s) => s.id === order.service_type) : null;
    const tServices = useTranslations("services");

    const serviceLabel = useMemo(() => {
        if (!order) return "—";
        if (service) {
            const key = `${service.id}.title` as const;
            return tServices.has(key) ? tServices(key) : (order.service_type || "—");
        }
        return order.service_type || "—";
    }, [order, service, tServices]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const showSignupToPay = isAuthed === false && !!pendingToken;

    const fullName = useMemo(() => {
        const fn = (order?.customer_first_name || "").trim();
        const ln = (order?.customer_last_name || "").trim();
        const v = [fn, ln].filter(Boolean).join(" ");
        return v || "—";
    }, [order]);

    const addrLine = useMemo(() => {
        const a = (order?.customer_address || "").trim();
        const plz = (order?.customer_postal_code || "").trim();
        const city = (order?.customer_city || "").trim();
        const country = (order?.customer_country || "").trim();

        const line2 = [plz, city].filter(Boolean).join(" ");
        const line3 = country;

        const lines = [a, line2, line3].filter(Boolean);
        return lines.length ? lines : ["—"];
    }, [order]);

    const safeMoney = (v: number | string) => {
        const n = typeof v === "string" ? Number(v) : v;
        if (!Number.isFinite(n)) return "—";
        return `€ ${n.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Check className="w-10 h-10 text-white"/>
                </div>

                {/* ✅ Reservation copy */}
                <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
                <p className="text-gray-500 mb-8">{t("subtitle")}</p>

                {loading && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-700">
                        {t("loading")}
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-700">{error}</div>
                )}

                {order && !loading && (
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                        <h3 className="font-semibold mb-4">{t("details.title")}</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.service")}</span>
                                <span className="font-medium text-right">{serviceLabel}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.date")}</span>
                                <span className="font-medium text-right">{formatDate(order.scheduled_date)}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.time")}</span>
                                <span className="font-medium text-right">{order.scheduled_time}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.duration")}</span>
                                <span className="font-medium text-right">
                  ~{order.estimated_hours}h
                </span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3"/>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.name")}</span>
                                <span className="font-medium text-right">{fullName}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.email")}</span>
                                <span className="font-medium text-right break-all">
                  {order.customer_email?.trim() || "—"}
                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.phone")}</span>
                                <span className="font-medium text-right">
                  {order.customer_phone?.trim() || "—"}
                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">{t("details.address")}</span>
                                <span className="font-medium text-right">
                  {addrLine.map((l, i) => (
                      <span key={i} className="block">
                      {l}
                    </span>
                  ))}
                </span>
                            </div>

                            {order.customer_notes?.trim() ? (
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">{t("details.notes")}</span>
                                    <span className="font-medium text-right">{order.customer_notes.trim()}</span>
                                </div>
                            ) : null}

                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                                <span className="font-semibold">{t("details.total")}</span>
                                <span className="font-bold text-lg">{safeMoney(order.total_price)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ BUTTONS: Pay first */}
                <div className="space-y-3">
                    {showSignupToPay ? (
                        <>
                            <button
                                type="button"
                                onClick={() => router.push(`/signup?pendingOrder=${encodeURIComponent(pendingToken)}`)}
                                className="block w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
                            >
                                {t("actions.createAccountToPay")}
                            </button>

                            <Link
                                href={href}
                                className="block w-full py-4 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                            >
                                {t("actions.home")}
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* ✅ Pay first (only if authed) */}
                            {isAuthed ? (
                                <button
                                    type="button"
                                    onClick={() => router.push("/account/orders")}
                                    className="block w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
                                >
                                    {t("actions.pay")}
                                </button>
                            ) : (
                                <Link
                                    href="/booking"
                                    className="block w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
                                >
                                    {t("actions.bookAnother")}
                                </Link>
                            )}

                            <Link
                                href="/"
                                className="block w-full py-4 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                            >
                                {t("actions.home")}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
            <Content/>
        </Suspense>
    );
}