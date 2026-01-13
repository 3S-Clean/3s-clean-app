"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ConfirmedClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const next = useMemo(() => {
        const n = searchParams.get("next");
        return n && n.startsWith("/") ? n : "/account";
    }, [searchParams]);

    const [seconds, setSeconds] = useState(2);
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (cancelled) return;

            const ok = !!data.session && !error;
            setHasSession(ok);

            if (ok) {
                setSeconds(2);

                const t = window.setInterval(() => {
                    setSeconds((s) => (s > 0 ? s - 1 : 0));
                }, 1000);

                const go = window.setTimeout(() => {
                    router.replace(next);
                    router.refresh();
                }, 1600);

                return () => {
                    window.clearInterval(t);
                    window.clearTimeout(go);
                };
            }
        };

        let cleanup: void | (() => void);

        run().then((c) => {
            cleanup = c as any;
        });

        return () => {
            cancelled = true;
            if (cleanup) cleanup();
        };
    }, [router, next]);

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                    Email confirmed
                </h1>

                <p className="mt-3 text-sm text-black/55">
                    Your email was confirmed successfully.
                </p>

                {hasSession === null && (
                    <p className="mt-6 text-sm text-black/55">Checking session…</p>
                )}

                {hasSession === true && (
                    <>
                        <p className="mt-6 text-sm text-black/55">
                            Redirecting to your account{seconds ? ` in ${seconds}s` : ""}…
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                router.replace(next);
                                router.refresh();
                            }}
                            className="mt-8 w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                        >
                            Continue
                        </button>
                    </>
                )}

                {hasSession === false && (
                    <>
                        <p className="mt-6 text-sm text-red-600">
                            Session not found. Please log in.
                        </p>

                        <a
                            href={`/login?next=${encodeURIComponent(next)}`}
                            className="mt-8 block w-full text-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                        >
                            Go to login
                        </a>
                    </>
                )}
            </div>
        </main>
    );
}