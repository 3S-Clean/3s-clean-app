"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type State = "working" | "failed" | "missing";

function getHashParams() {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        error: params.get("error"),
        error_description: params.get("error_description"),
    };
}

export default function CallbackPage() {
    const router = useRouter();
    const [state, setState] = useState<State>("working");
    const [desc, setDesc] = useState("");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const hp = getHashParams();

            // 1) Supabase прислал ошибку в hash
            if (hp.error) {
                if (cancelled) return;
                setDesc(hp.error_description || "Email link is invalid or has expired.");
                setState("failed");
                return;
            }

            // 2) PKCE flow: code в query
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (cancelled) return;

                if (error) {
                    setDesc(error.message || "Email link is invalid or has expired.");
                    setState("failed");
                    return;
                }

                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 3) Implicit flow: access/refresh в hash
            if (hp.access_token && hp.refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token: hp.access_token,
                    refresh_token: hp.refresh_token,
                });
                if (cancelled) return;

                if (error) {
                    setDesc(error.message || "Email link is invalid or has expired.");
                    setState("failed");
                    return;
                }

                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 4) Вообще ничего не пришло
            if (cancelled) return;
            setDesc("This link is missing data or has already been used.");
            setState("missing");
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (state === "failed" || state === "missing") {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-black">
                    {state === "failed" ? "Confirmation failed" : "Invalid link"}
                </h1>

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