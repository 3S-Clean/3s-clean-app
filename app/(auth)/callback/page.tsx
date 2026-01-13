"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type State = "working" | "success" | "failed" | "missing";

function readHash() {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const p = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        error: p.get("error") || p.get("error_code"),
        error_description: p.get("error_description"),
        access_token: p.get("access_token"),
        refresh_token: p.get("refresh_token"),
    };
}

export default function CallbackPage() {
    const router = useRouter();
    const [state, setState] = useState<State>("working");
    const [desc, setDesc] = useState<string>("");

    useEffect(() => {
        (async () => {
            const url = new URL(window.location.href);

            // 1) ошибки могут быть в query
            const qErr = url.searchParams.get("error") || url.searchParams.get("error_code");
            const qDesc = url.searchParams.get("error_description");

            // 2) и/или в hash
            const h = readHash();

            const anyErr = qErr || h.error;
            const anyDesc = qDesc || h.error_description || "";

            if (anyErr) {
                setDesc(anyDesc || "Email link is invalid or has expired.");
                setState("failed");
                return;
            }

            // 3) основной путь (PKCE) — code в query
            const code = url.searchParams.get("code");
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    setDesc(error.message);
                    setState("failed");
                    return;
                }
                setState("success");
                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 4) иногда приходят access/refresh в hash
            if (h.access_token && h.refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token: h.access_token,
                    refresh_token: h.refresh_token,
                });

                if (error) {
                    setDesc(error.message);
                    setState("failed");
                    return;
                }

                setState("success");
                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 5) ничего полезного не пришло
            setState("missing");
        })();
    }, [router]);

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                {state === "working" && (
                    <>
                        <h1 className="text-2xl font-semibold text-black">Confirming…</h1>
                        <p className="mt-4 text-sm text-black/55">Please wait.</p>
                    </>
                )}

                {state === "missing" && (
                    <>
                        <h1 className="text-2xl font-semibold text-black">Invalid link</h1>
                        <p className="mt-4 text-sm text-black/55">
                            This confirmation link is missing data or has already been used.
                        </p>
                        <Link
                            href="/login"
                            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                        >
                            Go to login
                        </Link>
                    </>
                )}

                {state === "failed" && (
                    <>
                        <h1 className="text-2xl font-semibold text-black">Confirmation failed</h1>
                        <p className="mt-4 text-sm text-black/55">{desc || "The link may be expired."}</p>
                        <Link
                            href="/login"
                            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                        >
                            Go to login
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}