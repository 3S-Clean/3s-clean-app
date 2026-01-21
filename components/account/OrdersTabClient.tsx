"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

function formatDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-GB", {
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

function statusLabel(s: string) {
    switch (s) {
        case "pending":
            return "Pending";
        case "confirmed":
            return "Confirmed";
        case "in_progress":
            return "In progress";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return s;
    }
}

function OrderHistoryEmpty() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">Order History</h2>
            <p className="mt-4 text-black/55">Your past orders will appear here.</p>

            <Link
                href="/booking"
                className="mt-6 inline-block px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
            >
                Create your first booking
            </Link>
        </div>
    );
}

export default function OrdersTabClient() {
    const supabase = useMemo(() => createClient(), []);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: u, error: uErr } = await supabase.auth.getUser();
                if (uErr || !u?.user) {
                    if (!cancelled) setError("Not authenticated.");
                    if (!cancelled) setOrders([]);
                    return;
                }

                const { data, error } = await supabase
                    .from("orders")
                    .select(
                        "id,status,service_type,apartment_size,people_count,scheduled_date,scheduled_time,estimated_hours,total_price,created_at"
                    )
                    .eq("user_id", u.user.id)
                    .order("scheduled_date", { ascending: true })
                    .order("scheduled_time", { ascending: true });

                if (cancelled) return;

                if (error) {
                    setError("We couldn’t load your orders.");
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
    }, [supabase]);

    if (loading) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-black md:text-2xl">Order History</h2>
                <p className="mt-4 text-black/55">Loading…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-black md:text-2xl">Order History</h2>
                <p className="mt-4 text-black/55">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return <OrderHistoryEmpty />;
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-black md:text-2xl">Order History</h2>
                    <p className="mt-1 text-black/55">All your bookings appear here.</p>
                </div>

                <Link
                    href="/booking"
                    className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                >
                    Book Now
                </Link>
            </div>

            <div className="space-y-4">
                {orders.map((o) => (
                    <Link
                        key={o.id}
                        href={`/account/orders/${o.id}`}
                        className="block rounded-3xl border border-gray-200 p-6 hover:shadow-sm transition"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-lg font-semibold">{o.service_type}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {formatDate(o.scheduled_date)} • {o.scheduled_time} • {hours(o.estimated_hours)}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {o.apartment_size} • {o.people_count} people
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-bold">{money(o.total_price)}</div>
                                <div className="text-sm text-gray-500 mt-1">{statusLabel(o.status)}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}