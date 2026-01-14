"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmedPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data } = await supabase.auth.getSession();
            if (cancelled) return;
            setHasSession(!!data.session);
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-black">
                Email confirmed
            </h1>

            <p className="mt-6 text-base text-black/55">
                Thank you — your email has been confirmed successfully.
            </p>

            {hasSession === true && (
                <button
                    type="button"
                    onClick={() => {
                        router.replace("/account");
                        router.refresh();
                    }}
                    className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
                >
                    Continue
                </button>
            )}

            {hasSession === false && (
                <p className="mt-10 text-sm text-black/45">
                    You can now safely close this tab or log in manually.
                </p>
            )}

            <p className="mt-10 text-sm text-black/40">
                If you have any issue confirming your account, please contact{" "}
                <a
                    href="mailto:support@3s-clean.com"
                    className="text-black hover:underline"
                >
                    support@3s-clean.com
                </a>.
            </p>
        </div>
    );
}