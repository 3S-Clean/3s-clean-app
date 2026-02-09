"use client";

import {useState} from "react";
import {BookOpen, Film, LogOut, User, UserRoundPen, Video} from "lucide-react";
import {LogoutButton} from "@/features/auth/components";
import {Footer, Header} from "@/shared/layout";
import PersonalInfoClient from "@/features/account/components/PersonalInfoClient";
import OrdersTabClient from "@/features/account/components/OrdersTabClient";
import Settings from "@/features/account/components/Settings";
import LiveCleaningVideoTab from "@/features/account/components/LiveCleaningVideoTab";
import VideoHistoryTab from "@/features/account/components/VideoHistoryTab";

import {createClient} from "@/shared/lib/supabase/client";
import {Avatar} from "@/shared/ui";
import {AvatarColorPicker} from "@/shared/ui";
import {CARD_FRAME_BASE} from "@/shared/ui";
import {useTranslations} from "next-intl";

type Tab = "personal" | "live" | "history" | "orders" | "settings";

function getGreetingKey(): "morning" | "day" | "evening" | "night" {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "day";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
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
    userId?: string | null;
    lastName?: string | null;
    avatarColor?: string | null;
}) {
    const t = useTranslations("account");
    const [activeTab, setActiveTab] = useState<Tab>("personal");

    const greeting = t(`greeting.${getGreetingKey()}`);
    const displayName = firstName?.trim() || email;

    const [currentAvatarColor, setCurrentAvatarColor] = useState<string | null>(avatarColor ?? null);

    const saveAvatarColor = async (color: string) => {
        if (!userId) {
            setCurrentAvatarColor(color);
            return;
        }

        const prev = currentAvatarColor;
        setCurrentAvatarColor(color);

        const supabase = createClient();
        const {error} = await supabase.from("profiles").update({avatar_color: color}).eq("id", userId);

        if (error) {
            setCurrentAvatarColor(prev ?? null);
            console.error("Failed to update avatar_color:", error);
            alert(t("errors.saveColor"));
        }
    };

    const tabs = [
        {id: "personal" as const, label: t("tabs.personal"), icon: User},
        {id: "live" as const, label: t("tabs.live"), icon: Video},
        {id: "history" as const, label: t("tabs.history"), icon: Film},
        {id: "orders" as const, label: t("tabs.orders"), icon: BookOpen},
        {id: "settings" as const, label: t("tabs.settings"), icon: UserRoundPen},
    ];

    return (
        <>
            <Header/>

            <div className="min-h-screen bg-[var(--background)] pt-[92px] text-[var(--text)]">
                <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8 space-y-6">
                    {/* Top Card */}
                    <div className={[
                        CARD_FRAME_BASE,
                        "p-7 md:p-10",
                        "min-h-[140px] md:min-h-[160px]",
                    ].join(" ")}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">{t("title")}</h1>
                                <p className="text-sm pt-1 text-[var(--muted)]">
                                    {greeting},{" "}
                                    <span className="text-[var(--text)] font-medium">{displayName}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Avatar
                                    firstName={firstName}
                                    lastName={lastName}
                                    email={email}
                                    color={currentAvatarColor}
                                    seed={(userId || email) ?? email}
                                    size={52}
                                />
                                {/* Next 15/16 rule: prop name ends with Action */}
                                <AvatarColorPicker value={currentAvatarColor} onChangeAction={saveAvatarColor}/>
                            </div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <nav className={[CARD_FRAME_BASE, "p-2"].join(" ")}>
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <div className="flex items-center gap-2">
                                <div
                                    className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap no-scrollbar snap-x-soft relative">
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
                                                            ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                                                            : "text-[var(--text)]/70 hover:bg-[var(--text)]/3 hover:text-[var(--text)]",
                                                    ].join(" ")}
                                                >
                                                    <Icon size={20} strokeWidth={1.5}/>
                                                    <span className="whitespace-nowrap">{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div
                                        className="pointer-events-none sticky right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-black to-transparent"/>
                                </div>

                                <div className="shrink-0">
                                    <div
                                        className={[
                                            "flex items-center gap-2.5 rounded-xl px-5 py-3 text-[15px] font-medium transition",
                                            "text-[var(--text)]/70 hover:bg-[var(--text)]/3 hover:text-[var(--text)]",
                                        ].join(" ")}
                                    >
                                        <LogOut size={20} strokeWidth={1.5} className="text-[var(--muted)]"/>
                                        <LogoutButton label={t("logout")} className="px-0 py-0"/>
                                    </div>
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
                                            isActive
                                                ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                                                : "text-[var(--text)]/70 hover:bg-[var(--text)]/3 hover:text-[var(--text)]",
                                        ].join(" ")}
                                    >
                                        <Icon size={20} strokeWidth={1.5}/>
                                        {tab.label}
                                    </button>
                                );
                            })}

                            <div className="my-1 h-px w-full bg-black/10 dark:bg-white/10"/>

                            <div className="flex items-center gap-3 rounded-xl px-4 py-3.5">
                                <LogOut size={20} strokeWidth={1.5} className="text-black/60 dark:text-white/60"/>
                                <LogoutButton label={t("logout")} className="text-[var(--muted)]"/>
                            </div>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className={[CARD_FRAME_BASE, "p-6 md:p-8"].join(" ")}>
                        {activeTab === "personal" && <PersonalInfoClient email={email}/>}
                        {activeTab === "live" && <LiveCleaningVideoTab/>}
                        {activeTab === "history" && <VideoHistoryTab/>}
                        {activeTab === "orders" && <OrdersTabClient/>}
                        {activeTab === "settings" && <Settings/>}
                    </div>
                </main>

                <Footer/>
            </div>
        </>
    );
}
