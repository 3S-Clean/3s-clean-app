"use client";

import {useState} from "react";
import {createClient} from "@/shared/lib/supabase/client";

export default function LogoutButton({
                                         className = "",
                                         label = "Logout",
                                     }: {
    className?: string;
    label?: string;
}) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        setLoading(true);

        // ✅ разлогинить ВЕЗДЕ (все устройства/сессии)
        await supabase.auth.signOut({scope: "global"});
        setLoading(false);
        window.location.href = "/";
    };

    return (
        <button
            type="button"
            onClick={onLogout}
            disabled={loading}
            className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-medium transition",
                "text-[var(--muted)] hover:bg-[var(--text)]/5 hover:text-[var(--text)]",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                className,
            ].join(" ")}
        >
            {loading ? "Signing out…" : label}
        </button>
    );
}