"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { SERVICES, addHoursToTime } from "@/lib/booking/config";

type Order = {
    id: string;
    service_type: string;
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:mm
    estimated_hours: number;
    customer_address: string;
    customer_postal_code: string;
    total_price: number;
    status: string;
};

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadOrder = async () => {
            try {
                if (!token) return;

                const supabase = createClient();

                // Ожидаем, что RPC вернёт массив строк (или один объект) — берём первый
                const { data, error } = await supabase.rpc("get_order_success", {
                    p_token: token,
                });

                if (cancelled) return;

                if (!error && data) {
                    const row = Array.isArray(data) ? data[0] : data;
                    if (row) setOrder(row as Order);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadOrder();

        return () => {
            cancelled = true;
        };
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading…
            </div>
        );
    }

    const serviceName = order ? SERVICES.find((s) => s.id === order.service_type)?.name ?? "" : "";
    const endTime = order ? addHoursToTime(order.scheduled_time, Number(order.estimated_hours)) : "";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">✓</span>
                </div>

                <h1 className="text-3xl font-semibold mb-3">Booking created successfully</h1>

                {!token && (
                    <p className="text-sm text-gray-500 mb-8">
                        Missing token. Please open this page from the confirmation link.
                    </p>
                )}

                {order && (
                    <div className="bg-white rounded-2xl p-6 text-left mb-8 shadow-sm">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Service</span>
                                <span className="font-medium text-right">{serviceName}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-right">
                  {new Date(order.scheduled_date + "T00:00:00").toLocaleDateString()}
                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium text-right">
                  {order.scheduled_time} – {endTime}
                </span>
                            </div>

                            <div className="border-t pt-3 mt-3 flex justify-between gap-4">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-right">€ {Number(order.total_price).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <Link
                    href={`/auth/register?token=${encodeURIComponent(token ?? "")}`}
                    className={`block w-full py-4 rounded-full ${
                        token ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-300 text-white pointer-events-none"
                    }`}
                >
                    Create account via code
                </Link>

                <Link href="/booking" className="block mt-4 text-sm text-gray-500 hover:text-gray-700">
                    ← Back to booking
                </Link>
            </div>
        </div>
    );
}