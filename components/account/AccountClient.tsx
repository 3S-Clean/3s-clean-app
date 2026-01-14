"use client";

import { useState } from "react";
import { User, Video, BookOpen, LogOut, Film } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { Logo } from "@/components/ui/Logo";

type Tab = "personal" | "live" | "history" | "orders";

const tabs = [
    { id: "personal" as const, label: "Personal Information", icon: User },
    { id: "live" as const, label: "Live Cleaning Video", icon: Video },
    { id: "history" as const, label: "Video History", icon: Film },
    { id: "orders" as const, label: "Order History", icon: BookOpen },
];

// ----- типы адреса (потом заменишь на supabase)
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

// мок (потом заменишь)
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
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const [address] = useState<Address | null>(mockAddress);

    return (
        <div className="min-h-screen bg-[#f8f8f8] px-4 py-8 md:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* ✅ Верхняя карточка: без logout на мобиле */}
                <header className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <Logo className="h-10 w-10" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-black">
                                    Account
                                </h1>
                                <p className="mt-2 text-sm text-black/55">
                                    Signed in as <span className="text-black">{email}</span>
                                </p>
                            </div>
                        </div>

                        {/* ✅ Logout показываем только на md+ (десктоп) */}
                        <div className="hidden md:flex items-center gap-2">
                            <LogoutButton
                                label="Logout"
                                className="gap-2"
                            />
                            <span className="sr-only">Logout</span>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <nav className="rounded-2xl bg-white p-2 shadow-sm">
                    {/* Desktop: горизонтально + logout в линии табов */}
                    <div className="hidden md:flex md:items-center md:justify-center md:gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        "flex items-center gap-2.5 rounded-xl px-5 py-3 text-[15px] font-medium transition",
                                        isActive
                                            ? "bg-black/5 text-black"
                                            : "text-black/70 hover:bg-black/5 hover:text-black",
                                    ].join(" ")}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}

                        <div className="mx-2 h-6 w-px bg-black/10" />

                        <div className="flex items-center gap-2">
                            <LogOut size={20} strokeWidth={1.5} className="text-black/60" />
                            <LogoutButton label="Logout" />
                        </div>
                    </div>

                    {/* Mobile: вертикально + logout внизу */}
                    <div className="flex flex-col gap-1 md:hidden">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition",
                                        isActive
                                            ? "bg-black/5 text-black"
                                            : "text-black/70 hover:bg-black/5",
                                    ].join(" ")}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}

                        <div className="my-1 h-px w-full bg-black/10" />

                        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5">
                            <LogOut size={20} strokeWidth={1.5} className="text-black/60" />
                            <LogoutButton label="Logout" className="px-0 py-0 hover:bg-transparent" />
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    {activeTab === "personal" && (
                        <PersonalInformation address={address} />
                    )}

                    {activeTab === "live" && <LiveCleaningVideo />}

                    {activeTab === "history" && <VideoHistory />}

                    {activeTab === "orders" && <OrderHistory />}
                </div>
            </div>
        </div>
    );
}

function PersonalInformation({ address }: { address: Address | null }) {
    if (!address) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-black md:text-2xl">
                    Personal Information
                </h2>
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
                    <h3 className="text-base font-medium text-black md:text-lg">
                        Current Address
                    </h3>

                    <div className="flex gap-3">
                        <button className="text-sm text-black/60 transition hover:text-black">
                            Edit
                        </button>
                        <button className="text-sm text-black/60 transition hover:text-red-600">
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
            <h2 className="text-xl font-semibold text-black md:text-2xl">
                Live Cleaning Video
            </h2>
            <p className="mt-4 text-black/55">
                Your live stream will appear here during an active service.
            </p>
        </div>
    );
}

function VideoHistory() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">
                Video History
            </h2>
            <p className="mt-4 text-black/55">
                Saved recordings will appear here after your service.
            </p>
        </div>
    );
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