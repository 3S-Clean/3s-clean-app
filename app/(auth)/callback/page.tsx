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

    useEffect(() => {
        (async () => {
            const hp = getHashParams();

            // 0) Supabase вернул ошибку через hash
            if (hp.error) {
                setState("failed");
                return;
            }

            // 1) Иногда приходит code в query
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    setState("failed");
                    return;
                }
                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 2) Чаще приходит access/refresh в hash
            if (hp.access_token && hp.refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token: hp.access_token,
                    refresh_token: hp.refresh_token,
                });
                if (error) {
                    setState("failed");
                    return;
                }
                router.replace("/confirmed");
                router.refresh();
                return;
            }

            // 3) Ничего не пришло
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
                        <p className="mt-4 text-sm text-black/55">
                            The link may be expired. Please request a new confirmation email.
                        </p>
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