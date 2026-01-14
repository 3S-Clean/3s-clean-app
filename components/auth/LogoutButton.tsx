"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({
                                         className = "",
                                         label = "Logout",
                                     }: {
    className?: string;
    label?: string;
}) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        setLoading(true);

        // ✅ разлогинить ВЕЗДЕ (все устройства/сессии)
        await supabase.auth.signOut({ scope: "global" });

        setLoading(false);
        router.replace("/login");
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={onLogout}
            disabled={loading}
            className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-medium transition",
                "text-black/70 hover:bg-black/5 hover:text-black",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                className,
            ].join(" ")}
        >
            {loading ? "Signing out…" : label}
        </button>
    );
}