"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ConfirmedClient() {
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data, error } = await supabase.auth.getSession();
            if (cancelled) return;
            setHasSession(!!data.session && !error);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                    Confirm your email
                </h1>

                <p className="mt-4 text-sm text-black/60">
                    We’ve sent a confirmation link to your email address.
                    <br />
                    Please open your inbox and confirm your email.
                </p>

                {/* ✅ Open Mail */}
                <a
                    href="mailto:"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                >
                    Open Mail
                </a>

                {/* ✅ пояснение про вкладку */}
                <p className="mt-6 text-xs text-black/45">
                    You can close this tab after confirming.
                </p>

                {/* если сессия есть — показываем кнопку в аккаунт */}
                {hasSession === true && (
                    <Link
                        href="/account"
                        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white py-3.5 text-[15px] font-medium text-black transition hover:bg-black/5"
                    >
                        Continue to account
                    </Link>
                )}

                {/* если сессии нет — предлагаем логин */}
                {hasSession === false && (
                    <p className="mt-6 text-sm text-black/55">
                        After confirming, you can{" "}
                        <Link href="/login" className="text-black hover:underline">
                            log in
                        </Link>
                        .
                    </p>
                )}

                {hasSession === null && (
                    <p className="mt-6 text-sm text-black/55">Checking session…</p>
                )}
            </div>
        </main>
    );
}