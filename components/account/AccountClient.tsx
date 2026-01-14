"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Video, BookOpen, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

const WEBFLOW_URL = "https://s3-final.webflow.io/";

// Типы для адреса (будут использоваться при booking)
interface Address {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    phone: string;
    email: string;
}

type Tab = "personal" | "video" | "orders";

const tabs = [
    { id: "personal" as const, label: "Personal Information", icon: User },
    { id: "video" as const, label: "Live Cleaning Video", icon: Video },
    { id: "orders" as const, label: "Order History", icon: BookOpen },
];

// Моковые данные (потом заменим на Supabase)
const mockAddress: Address = {
    id: "1",
    firstName: "John",
    lastName: "John",
    street: "Mainstraße",
    city: "Berlin",
    country: "Germany",
    postalCode: "70111",
    phone: "176999907551",
    email: "mail@icloud.com",
};

export default function AccountClient({ email }: { email: string }) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const [address] = useState<Address | null>(mockAddress);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);

        // ✅ разлогинить везде (все устройства)
        await supabase.auth.signOut({ scope: "global" });

        setLoggingOut(false);
        router.replace("/login");
        router.refresh();
    };

    const handleEdit = () => {
        console.log("Edit address");
    };

    const handleDelete = () => {
        console.log("Delete address");
    };

    return (
        <div className="min-h-screen bg-[#f8f8f8] px-4 py-8 md:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Card */}
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-center justify-between">
                        <a
                            href={WEBFLOW_URL}
                            aria-label="Go to main website"
                            className="inline-flex items-center justify-center cursor-pointer transition text-black/70 hover:text-black/40"
                        >
                            <Logo className="h-12 w-12" />
                        </a>

                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-medium text-black/70 transition hover:bg-black/5 hover:text-black disabled:opacity-40"
                        >
                            <LogOut size={18} strokeWidth={1.5} />
                            {loggingOut ? "Signing out…" : "Logout"}
                        </button>
                    </div>

                    <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black">
                        Account
                    </h1>

                    <p className="mt-2 text-sm text-black/55">
                        Signed in as <span className="text-black">{email}</span>
                    </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="rounded-2xl bg-white p-2 shadow-sm">
                    {/* Desktop: horizontal */}
                    <div className="hidden md:flex md:items-center md:justify-center md:gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        "flex items-center gap-2.5 rounded-xl px-5 py-3 text-[15px] font-medium transition",
                                        isActive ? "bg-black/5 text-black" : "text-black/70 hover:bg-black/5 hover:text-black",
                                    ].join(" ")}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile: vertical */}
                    <div className="flex flex-col gap-1 md:hidden">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition",
                                        isActive ? "bg-black/5 text-black" : "text-black/70 hover:bg-black/5",
                                    ].join(" ")}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}

                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-40"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            {loggingOut ? "Signing out…" : "Logout"}
                        </button>
                    </div>
                </nav>

                {/* Tab Content */}
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    {activeTab === "personal" && (
                        <PersonalInformation address={address} onEdit={handleEdit} onDelete={handleDelete} />
                    )}

                    {activeTab === "video" && <LiveCleaningVideo />}

                    {activeTab === "orders" && <OrderHistory />}
                </div>
            </div>
        </div>
    );
}

// ============ Tab Components ============

interface PersonalInformationProps {
    address: Address | null;
    onEdit: () => void;
    onDelete: () => void;
}

function PersonalInformation({ address, onEdit, onDelete }: PersonalInformationProps) {
    if (!address) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-black md:text-2xl">Personal Information</h2>
                <p className="mt-4 text-black/55">
                    No address saved yet. Add one during your first booking.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-center text-xl font-semibold text-black md:text-2xl">
                Personal Information
            </h2>

            <div className="mt-6 md:mt-8">
                <div className="flex items-start justify-between">
                    <h3 className="text-base font-medium text-black md:text-lg">Current Address</h3>
                    <div className="flex gap-3">
                        <button onClick={onEdit} className="text-sm text-black/60 transition hover:text-black">
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="text-sm text-black/60 transition hover:text-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="mt-4 space-y-1 text-[15px] text-black/80">
                    <p className="font-medium text-black">
                        {address.firstName} {address.lastName}
                    </p>
                    <p>{address.street}</p>
                    <p>{address.city}</p>
                    <p>
                        {address.country} {address.postalCode}
                    </p>
                    <a
                        href={`tel:${address.phone}`}
                        className="block text-black underline decoration-black/30 underline-offset-2 hover:decoration-black"
                    >
                        {address.phone}
                    </a>
                    <p>{address.email}</p>
                </div>
            </div>
        </div>
    );
}

function LiveCleaningVideo() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">Live Cleaning Video</h2>
            <p className="mt-4 text-black/55">
                Your live cleaning videos will appear here after your service.
            </p>
        </div>
    );
}

function OrderHistory() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">Order History</h2>
            <p className="mt-4 text-black/55">Your past orders will appear here.</p>
        </div>
    );
}