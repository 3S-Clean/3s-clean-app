"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Flow = "signup" | "recovery";

function VerifyCodeInner() {
    const router = useRouter();
    const sp = useSearchParams();

    const rawFlow = sp.get("flow");
    const flow: Flow = rawFlow === "recovery" ? "recovery" : "signup";

    const supabase = useMemo(() => createClient(), []);

    const [email, setEmail] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<null | { type: "error" | "ok"; msg: string }>(null);
    const [loading, setLoading] = useState(false);

    // 1) Берём email из localStorage
    useEffect(() => {
        const stored = (() => {
            try {
                const key = flow === "recovery" ? "pendingResetEmail" : "pendingEmail";
                return localStorage.getItem(key);
            } catch {
                return null;
            }
        })();

        if (!stored) {
            router.replace(flow === "signup" ? "/signup" : "/forgot-password");
            return;
        }

        setEmail(stored);
    }, [flow, router]);

    // 2) Проверка OTP (8 цифр)
    const verify = async () => {
        setStatus(null);
        setLoading(true);

        try {
            if (!email) {
                setStatus({ type: "error", msg: "Missing email. Please start again." });
                return;
            }

            if (!/^\d{8}$/.test(code)) {
                setStatus({ type: "error", msg: "Enter the 8-digit verification code." });
                return;
            }

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: flow === "recovery" ? "recovery" : "email",
            });

            if (error) {
                setStatus({ type: "error", msg: error.message });
                return;
            }

            // чистим localStorage
            try {
                const key = flow === "recovery" ? "pendingResetEmail" : "pendingEmail";
                localStorage.removeItem(key);
            } catch {}

            // ✅ ВАЖНО: правильный редирект
            if (flow === "signup") {
                router.replace("/set-password");      // регистрация → задать пароль
            } else {
                router.replace("/reset-password");   // forgot password → новый пароль
            }

            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    // 3) Повторная отправка кода
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

            if (error) setStatus({ type: "error", msg: error.message });
            else setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
        } else {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) setStatus({ type: "error", msg: error.message });
            else setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
        }
    };

    if (email === null) {
        return (
            <div className="text-center">
                <div className="animate-pulse text-black/40">Loading…</div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-black">
                {flow === "signup" ? "Verify your email" : "Enter reset code"}
            </h1>

            <p className="mt-6 text-base text-black/55">
                We sent a verification code to{" "}
                <span className="font-medium text-black">{email}</span>.
            </p>

            <div className="mt-10 space-y-4">
                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-black/10 bg-white/95 px-4 py-3.5 text-center text-[18px] tracking-[0.35em] outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/10"
                />

                <button
                    type="button"
                    onClick={verify}
                    disabled={loading || code.length !== 8}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40"
                >
                    {loading ? "Verifying…" : "Verify"}
                </button>

                <button
                    type="button"
                    onClick={resend}
                    className="w-full rounded-2xl border border-black/10 bg-white/95 py-3.5 text-[15px] font-medium text-black transition hover:bg-black/5"
                >
                    Resend code
                </button>

                {status && (
                    <p className={status.type === "ok" ? "text-sm text-black/60" : "text-sm text-red-600"}>
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

export default function VerifyCodePage() {
    return (
        <Suspense
            fallback={
                <div className="text-center">
                    <div className="animate-pulse text-black/40">Loading…</div>
                </div>
            }
        >
            <VerifyCodeInner />
        </Suspense>
    );
}