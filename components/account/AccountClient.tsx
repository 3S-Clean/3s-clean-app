"use client";

import { useState } from "react";
import { User, Video, BookOpen, LogOut, Film, UserRoundPen } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PersonalInfoClient from "@/components/account/PersonalInfoClient";
import OrdersTabClient from "@/components/account/OrdersTabClient";
import Settings from "@/components/account/Settings";

import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { AvatarColorPicker } from "@/components/ui/avatarcolor/AvatarColorPicker";

type Tab = "personal" | "live" | "history" | "orders" | "settings";

const tabs = [
    { id: "personal" as const, label: "Personal Information", icon: User },
    { id: "live" as const, label: "Live Cleaning Video", icon: Video },
    { id: "history" as const, label: "Video History", icon: Film },
    { id: "orders" as const, label: "Order History", icon: BookOpen },
    { id: "settings" as const, label: "Settings", icon: UserRoundPen },
];

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) return "Good morning";
    if (hour >= 11 && hour < 17) return "Hello";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
}

export default function AccountClient({
                                          email,
                                          firstName,
                                          userId,
                                          lastName,
                                          avatarColor,
                                      }: {
    email: string;
    firstName?: string | null;

    // ✅ добавили, но название компонента и остальное не меняем
    userId?: string | null;
    lastName?: string | null;
    avatarColor?: string | null;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const greeting = getGreeting();
    const displayName = firstName?.trim() || email;

    const [currentAvatarColor, setCurrentAvatarColor] = useState<string | null>(avatarColor ?? null);

    const saveAvatarColor = async (color: string) => {
        // если userId нет — просто меняем локально (чтобы UI не ломался)
        if (!userId) {
            setCurrentAvatarColor(color);
            return;
        }

        const prev = currentAvatarColor;
        setCurrentAvatarColor(color);

        const supabase = createClient();
        const { error } = await supabase.from("profiles").update({ avatar_color: color }).eq("id", userId);

        if (error) {
            setCurrentAvatarColor(prev ?? null);
            console.error("Failed to update avatar_color:", error);
            alert("Could not save color. Please try again.");
        }
    };

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
                                <h1 className="text-3xl font-semibold tracking-tight text-black">Account</h1>
                                <p className="text-sm pt-1 text-gray-600">
                                    {greeting},{" "}
                                    <span className="text-black font-medium">{displayName}</span>
                                </p>
                            </div>

                            {/* ✅ Avatar + Palette (всегда видно, и на мобиле тоже) */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Avatar
                                    firstName={firstName}
                                    lastName={lastName}
                                    email={email}
                                    color={currentAvatarColor}
                                    seed={(userId || email) ?? email}
                                    size={52}
                                />
                                <AvatarColorPicker value={currentAvatarColor} onChangeAction={saveAvatarColor} />
                            </div>

                            {/* ❌ Logout md+ убрали отсюда, чтобы не было дублей (он уже есть в Tabs) */}
                        </div>
                    </div>
                    {/* Tabs */}
                    <nav className="rounded-2xl bg-white p-2 shadow-sm">
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="flex items-center">
                                    {/* Tabs scroll area (only tabs scroll) */}
                                    <div className="flex-1 overflow-x-auto whitespace-nowrap no-scrollbar snap-x-soft pr-36">
                                        <div className="flex items-center gap-2 px-2">
                                            {tabs.map((tab) => {
                                                const Icon = tab.icon;
                                                const isActive = activeTab === tab.id;

                                                return (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={[
                                                            "snap-item shrink-0 flex items-center gap-2.5 rounded-xl px-5 py-3 text-[15px] font-medium transition",
                                                            isActive
                                                                ? "bg-black/5 text-black"
                                                                : "text-black/70 hover:bg-black/5 hover:text-black",
                                                        ].join(" ")}
                                                    >
                                                        <Icon size={20} strokeWidth={1.5} />
                                                        <span className="whitespace-nowrap">{tab.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Pinned logout (does not scroll) */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md">
                                            <LogOut size={20} strokeWidth={1.5} className="text-black/60" />
                                            <LogoutButton label="Logout" />
                                        </div>
                                    </div>

                                    {/* Fade hint under pinned area */}
                                    <div className="pointer-events-none absolute right-0 top-0 h-full w-36 bg-gradient-to-l from-white to-white/0" />
                                </div>
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
                                            isActive ? "bg-black/5 text-black" : "text-black/70 hover:bg-black/5",
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
                        {activeTab === "personal" && <PersonalInfoClient email={email} />}
                        {activeTab === "live" && <LiveCleaningVideo />}
                        {activeTab === "history" && <VideoHistory />}
                        {activeTab === "orders" && <OrdersTabClient />}
                        {activeTab === "settings" && <Settings />}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}

/* ----------------- Tabs Content ----------------- */

function LiveCleaningVideo() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">Live Cleaning Video</h2>
            <p className="mt-4 text-black/55">Your live stream will appear here during an active service.</p>
        </div>
    );
}

function VideoHistory() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">Video History</h2>
            <p className="mt-4 text-black/55">Saved recordings will appear here after your service.</p>
        </div>
    );
}