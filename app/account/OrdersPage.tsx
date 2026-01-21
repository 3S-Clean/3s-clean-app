// app/account/orders/OrdersPage.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function OrderHistory() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">
                Order History
            </h2>
            <p className="mt-4 text-black/55">
                Your past orders will appear here.
            </p>
        </div>
    );
}

export default async function OrdersPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data, error } = await supabase
        .from("orders")
        .select(
            "id,status,service_type,apartment_size,people_count,scheduled_date,scheduled_time,estimated_hours,total_price,created_at"
        )
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

    if (error) {
        return (
            <div className="min-h-screen bg-white px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-semibold mb-3">Order History</h1>
                    <p className="text-gray-500">We couldn’t load your orders.</p>
                </div>
            </div>
        );
    }

    const orders = (data ?? []) as OrderRow[];

    return (
        <div className="min-h-screen bg-white px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold">Order History</h1>
                        <p className="text-gray-500 mt-1">All your bookings appear here.</p>
                    </div>

                    <Link
                        href="/booking"
                        className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                    >
                        Book Now
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200 p-10">
                        <OrderHistory />
                        <div className="mt-6 text-center">
                            <Link
                                href="/booking"
                                className="inline-block px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                            >
                                Create your first booking
                            </Link>
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}