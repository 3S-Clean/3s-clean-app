"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        try {
            setLoading(true);

            // ✅ разлогиниваемся ВЕЗДЕ (все сессии)
            await supabase.auth.signOut();

            router.replace("/login");
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={onLogout}
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {loading ? "Signing out…" : "Log out"}
        </button>
    );
}