"use client";

import { useState } from "react";
import { User, Video, BookOpen, LogOut, Film } from "lucide-react";

import LogoutButton from "@/components/auth/LogoutButton";
import Header from "@/components/account/header/Header";
import Footer from "@/components/account/footer/Footer";
import PersonalInfoClient from "@/app/account/PersonalInfoClient";

type Tab = "personal" | "live" | "history" | "orders";

const tabs = [
    { id: "personal" as const, label: "Personal Information", icon: User },
    { id: "live" as const, label: "Live Cleaning Video", icon: Video },
    { id: "history" as const, label: "Video History", icon: Film },
    { id: "orders" as const, label: "Order History", icon: BookOpen },
];

export default function AccountClient({ email }: { email: string }) {
    const [activeTab, setActiveTab] = useState<Tab>("personal");

    return (
        <>
            {/* FIXED HEADER */}
            <Header />

            {/* PAGE */}
            <div className="min-h-screen bg-[#f8f8f8] pt-[92px]">
                {/* CONTENT */}
                <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8 space-y-6">
                    {/* Top Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-black">
                                    Account
                                </h1>
                                <p className="mt-2 text-sm text-black/55">
                                    Signed in as <span className="text-black">{email}</span>
                                </p>
                            </div>

                            {/* Logout md+ */}
                            <div className="hidden md:flex items-center gap-2">
                                <LogoutButton label="Logout" className="gap-2" />
                                <span className="sr-only">Logout</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <nav className="rounded-2xl bg-white p-2 shadow-sm">
                        {/* Desktop */}
                        <div className="hidden md:flex items-center justify-center gap-2">
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

                        {/* Mobile */}
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
                                <LogoutButton
                                    label="Logout"
                                    className="px-0 py-0 hover:bg-transparent"
                                />
                            </div>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                        {activeTab === "personal" && <PersonalInfoClient email={email} />}
                        {activeTab === "live" && <LiveCleaningVideo />}
                        {activeTab === "history" && <VideoHistory />}
                        {activeTab === "orders" && <OrderHistory />}
                    </div>
                </main>

                {/* FOOTER */}
                <Footer />
            </div>
        </>
    );
}

/* ----------------- Tabs Content ----------------- */

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