"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type State = "working" | "failed";

function getHashParams() {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        error: params.get("error"),
        error_description: params.get("error_description"),
    };
}

export default function CallbackPage() {
    const supabase = createClient();
    const [state, setState] = useState<State>("working");
    const [desc, setDesc] = useState("");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const hp = getHashParams();

            // 1) если Supabase вернул ошибку — показываем failed
            if (hp.error) {
                if (cancelled) return;

                const msg = hp.error_description || "Email link is invalid or has expired.";
                setDesc(msg);
                setState("failed");

                // уберём hash, чтобы не путал при рефреше
                window.history.replaceState(null, "", window.location.pathname);
                return;
            }

            // 2) успех: чистим pendingEmail и ВЫХОДИМ локально (на всякий случай, если сессия вдруг появилась)
            try {
                localStorage.removeItem("pendingEmail");
            } catch {}

            await supabase.auth.signOut({ scope: "local" });

            // уберём hash (и возможные query) из URL
            window.history.replaceState(null, "", window.location.pathname);

            // 3) отправляем на /confirmed (там кнопка “Continue”)
            window.location.replace("/confirmed");
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    if (state === "failed") {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-black">Confirmation failed</h1>
                <p className="mt-4 text-sm text-black/55">{desc}</p>

                <Link
                    href="/login"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
                >
                    Go to login
                </Link>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-2xl font-semibold text-black">Confirming…</h1>
            <p className="mt-4 text-sm text-black/55">Please wait.</p>
        </div>
    );
}