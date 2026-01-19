"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICES } from "@/lib/booking/config";
import { Check } from "lucide-react";

type Order = {
    id: string;
    service_type: string;
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number;
    total_price: number | string;
    status: string;
};

function Content() {
    const sp = useSearchParams();

    const orderId = sp.get("orderId") || "";
    const pendingToken = sp.get("pendingToken") || "";

    // ✅ приоритет: orderId > pendingToken
    const query = useMemo(() => {
        if (orderId) return { orderId };
        if (pendingToken) return { pendingToken };
        return null;
    }, [orderId, pendingToken]);

    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { resetBooking } = useBookingStore();

    useEffect(() => {
        resetBooking();
    }, [resetBooking]);

    useEffect(() => {
        if (!query) {
            setError("Missing booking reference (orderId or pendingToken).");
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(query),
                    signal: controller.signal,
                });

                const json: { order?: Order; error?: string } = await res.json();

                if (!res.ok) {
                    setError(json?.error || "Failed to load booking.");
                    setOrder(null);
                    return;
                }

                setOrder(json?.order ?? null);
                if (!json?.order) setError("Booking not found.");
            } catch (e: unknown) {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setError(e instanceof Error ? e.message : "Failed to load booking.");
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        void run();
        return () => controller.abort();
    }, [query]);

    const service = order ? SERVICES.find((s) => s.id === order.service_type) : null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Check className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-3xl font-semibold mb-4">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you! We&apos;ve sent a confirmation email.</p>

                {loading && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-700">
                        Loading booking details…
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-700">
                        {error}
                    </div>
                )}

                {order && !loading && (
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                        <h3 className="font-semibold mb-4">Booking Details</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Service</span>
                                <span className="font-medium">{service?.name ?? order.service_type}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium">{formatDate(order.scheduled_date)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium">{order.scheduled_time}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Duration</span>
                                <span className="font-medium">~{order.estimated_hours}h</span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-lg">€ {Number(order.total_price).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
                    >
                        Back to Home
                    </Link>

                    <Link
                        href="/booking"
                        className="block w-full py-4 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
                    >
                        Book Another
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Content />
        </Suspense>
    );
}