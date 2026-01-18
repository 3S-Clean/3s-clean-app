// app/booking/success/page.tsx
"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getOrderSuccess } from "@/lib/booking/actions";
import { useBookingStore } from "@/lib/booking/store";

type SuccessRow = {
    service_type?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    estimated_hours?: number | string;
    customer_address?: string;
    customer_postal_code?: string;
    total_price?: number | string;
};

type SuccessResponse =
    | { data: SuccessRow | null }
    | { error: string; data: null };

// ✅ безопасные type-guards без "as { error: ... }" на res
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function isSuccessResponse(v: unknown): v is SuccessResponse {
    if (!isRecord(v)) return false;

    // error-case
    if ("error" in v) {
        return typeof v.error === "string" && "data" in v;
    }

    // ok-case
    if ("data" in v) {
        return v.data === null || isRecord(v.data);
    }

    return false;
}

function SuccessInner() {
    const sp = useSearchParams();
    const token = useMemo(() => (sp.get("token") ?? "").trim(), [sp]);

    const { resetBooking } = useBookingStore();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<SuccessRow | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        resetBooking();

        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);

                if (!token) {
                    if (!cancelled) setOrder(null);
                    return;
                }

                const raw: unknown = await getOrderSuccess(token);
                if (cancelled) return;

                // ✅ нормализуем ответ в 2 формы: {data} или {error,data:null}
                const res: SuccessResponse = isSuccessResponse(raw) ? raw : { data: null };

                if ("error" in res) {
                    setError(res.error);
                    setOrder(null);
                    return;
                }

                setOrder(res.data ?? null);
            } catch (e: unknown) {
                if (!cancelled) {
                    const msg = e instanceof Error ? e.message : "Failed to load booking details.";
                    setError(msg);
                    setOrder(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [token, resetBooking]);

    const total = useMemo(() => {
        const n = Number(order?.total_price);
        return Number.isFinite(n) ? n : null;
    }, [order]);

    const hours = useMemo(() => {
        const n = Number(order?.estimated_hours);
        return Number.isFinite(n) ? n : null;
    }, [order]);

    return (
        <main className="min-h-screen px-4 py-12 bg-[#f6f5f2]">
            <div className="mx-auto w-full max-w-2xl">
                <div className="rounded-[28px] border border-black/10 bg-white/60 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-black">Booking confirmed</h1>
                            <p className="mt-2 text-sm text-black/55">Thank you. Here are your details:</p>
                        </div>
                        <div className="h-12 w-12 rounded-full border border-black/10 bg-white/70 flex items-center justify-center">
                            <span className="text-lg">✓</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-6 text-sm text-black/60">Loading...</div>
                    ) : !token ? (
                        <div className="mt-6 text-sm text-black/60">Missing token. Please open the success link again.</div>
                    ) : error ? (
                        <div className="mt-6 text-sm text-black/60">
                            We can&apos;t load booking details right now.
                            <div className="mt-2 text-xs text-black/45">{error}</div>
                        </div>
                    ) : !order ? (
                        <div className="mt-6 text-sm text-black/60">We can&apos;t load booking details right now.</div>
                    ) : (
                        <div className="mt-6 grid gap-3 text-sm text-black/70">
                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Service</div>
                                <div className="mt-1 font-medium text-black/75">{order.service_type ?? "—"}</div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Date &amp; time</div>
                                <div className="mt-1 font-medium text-black/75">
                                    {String(order.scheduled_date ?? "—")} • {String(order.scheduled_time ?? "—")}
                                    {hours != null ? <span className="text-black/55"> • ~{hours}h</span> : null}
                                </div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Address</div>
                                <div className="mt-1 font-medium text-black/75">
                                    {String(order.customer_address ?? "—")} • {String(order.customer_postal_code ?? "—")}
                                </div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Total</div>
                                <div className="mt-1 text-xl font-semibold tracking-tight text-black">
                                    € {total != null ? total.toFixed(2) : "—"}
                                </div>
                                <div className="mt-1 text-sm text-black/55">inc. VAT</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 grid gap-3">
                        <Link
                            href="/"
                            className="w-full rounded-full border border-black/15 bg-black px-4 py-3 text-sm font-medium text-white text-center hover:bg-black/90"
                        >
                            Back to Home
                        </Link>

                        <Link
                            href="/booking"
                            className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black text-center hover:bg-black/5"
                        >
                            Book another cleaning
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen px-4 py-12 bg-[#f6f5f2]">
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="rounded-[28px] border border-black/10 bg-white/60 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-sm text-black/60">Loading...</div>
                        </div>
                    </div>
                </main>
            }
        >
            <SuccessInner />
        </Suspense>
    );
}