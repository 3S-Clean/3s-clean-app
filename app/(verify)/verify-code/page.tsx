"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Flow = "signup" | "recovery";

export default function VerifyCodePage() {
    const router = useRouter();
    const sp = useSearchParams();

    const rawFlow = sp.get("flow");
    const flow: Flow = rawFlow === "recovery" ? "recovery" : "signup";

    const supabase = createClient();

    const [email, setEmail] = useState<string | null>(null); // null = ещё не проверяли
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<null | { type: "error" | "ok"; msg: string }>(null);
    const [loading, setLoading] = useState(false);

    // Получаем email из localStorage
    useEffect(() => {
        const stored = localStorage.getItem("pendingEmail");

        if (!stored) {
            router.replace(flow === "signup" ? "/signup" : "/reset-password");
            return;
        }

        setEmail(stored);
    }, [flow, router]);

    const verify = async () => {
        setStatus(null);
        setLoading(true);

        if (!email) {
            setStatus({ type: "error", msg: "Missing email. Please start again." });
            setLoading(false);
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            setStatus({ type: "error", msg: "Enter the 6-digit code." });
            setLoading(false);
            return;
        }

        const otpType: "signup" | "recovery" = flow === "signup" ? "signup" : "recovery";

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: otpType,
        });

        setLoading(false);

        if (error) {
            setStatus({ type: "error", msg: error.message });
            return;
        }

        localStorage.removeItem("pendingEmail");

        if (flow === "signup") {
            router.replace("/set-password");
        } else {
            router.replace("/reset-password/new");
        }
        router.refresh();
    };

    const resend = async () => {
        setStatus(null);

        if (!email) {
            setStatus({ type: "error", msg: "Missing email. Please start again." });
            return;
        }

        if (flow === "signup") {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email,
            });

            if (error) {
                setStatus({ type: "error", msg: error.message });
            } else {
                setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
            }
            return;
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
        });

        if (error) {
            setStatus({ type: "error", msg: error.message });
        } else {
            setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
        }
    };

    // email === null означает, что ещё идёт проверка localStorage
    if (email === null) {
        return (
            <div className="text-center">
                <div className="animate-pulse text-black/40">Loading...</div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-black">Enter code</h1>

            <p className="mt-6 text-base text-black/55">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-black">{email}</span>.
            </p>

            <div className="mt-10 space-y-4">
                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3.5 text-center text-[18px] tracking-[0.35em] outline-none backdrop-blur transition focus:border-black/20 focus:ring-2 focus:ring-black/10"
                />

                <button
                    type="button"
                    onClick={verify}
                    disabled={loading || code.length !== 6}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading ? "Verifying…" : "Verify"}
                </button>

                <button
                    type="button"
                    onClick={resend}
                    className="w-full rounded-2xl border border-black/10 bg-white/70 py-3.5 text-[15px] font-medium text-black transition hover:bg-black/5"
                >
                    Resend code
                </button>

                {status && (
                    <p
                        className={
                            status.type === "ok" ? "text-sm text-black/60" : "text-sm text-red-600"
                        }
                    >
                        {status.msg}
                    </p>
                )}
            </div>

            <p className="mt-10 text-sm text-black/40">
                If you entered the wrong email, go back and try again.
            </p>
        </div>
    );
}