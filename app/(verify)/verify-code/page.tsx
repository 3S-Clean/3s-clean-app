"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Flow = "signup" | "recovery";

const OTP_TTL_SEC = 600; // 10 minutes
const RESEND_COOLDOWN_SEC = 120; // 2 minutes

function fmt(sec: number) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

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

    const [expiresLeft, setExpiresLeft] = useState<number>(OTP_TTL_SEC);
    const [cooldownLeft, setCooldownLeft] = useState<number>(0);

    const restartOtpTimer = () => setExpiresLeft(OTP_TTL_SEC);
    const startCooldown = () => setCooldownLeft(RESEND_COOLDOWN_SEC);

    const storageKey = flow === "recovery" ? "pendingResetEmail" : "pendingEmail";

    useEffect(() => {
        const stored = (() => {
            try {
                return localStorage.getItem(storageKey);
            } catch {
                return null;
            }
        })();

        if (!stored) {
            router.replace(flow === "signup" ? "/signup" : "/forgot-password");
            return;
        }

        setEmail(stored);
        restartOtpTimer();
    }, [flow, router, storageKey]);

    useEffect(() => {
        if (!email) return;
        const id = window.setInterval(() => {
            setExpiresLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => window.clearInterval(id);
    }, [email]);

    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const id = window.setInterval(() => {
            setCooldownLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => window.clearInterval(id);
    }, [cooldownLeft]);

    async function waitForSession(maxAttempts = 5, delayMs = 200) {
        for (let i = 0; i < maxAttempts; i++) {
            const { data } = await supabase.auth.getSession();
            if (data.session) return data.session;
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return null;
    }

    const verify = async () => {
        setStatus(null);
        setLoading(true);

        try {
            if (!email) {
                setStatus({ type: "error", msg: "Missing email. Please start again." });
                return;
            }

            const token = code.replace(/\D/g, "").slice(0, 8);
            if (!/^\d{8}$/.test(token)) {
                setStatus({ type: "error", msg: "Enter the 8-digit verification code." });
                return;
            }

            if (expiresLeft <= 0) {
                setStatus({ type: "error", msg: "This code has expired. Please request a new one." });
                return;
            }

            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: flow === "recovery" ? "recovery" : "signup",
            });

            if (error) {
                setStatus({ type: "error", msg: error.message });
                return;
            }

            if (flow === "recovery") {
                const session = await waitForSession();
                if (!session) {
                    setStatus({
                        type: "error",
                        msg: "Recovery session not found yet. Please try again or request a new code.",
                    });
                    return;
                }
                try {
                    sessionStorage.setItem("recoveryFlow", "1");
                } catch {}
            }

            try {
                localStorage.removeItem(storageKey);
            } catch {}

            if (flow === "signup") {
                router.replace("/set-password");
            } else {
                router.replace("/reset-password?flow=recovery");
            }
            return;
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setStatus(null);

        if (!email) {
            setStatus({ type: "error", msg: "Missing email. Please start again." });
            return;
        }

        if (cooldownLeft > 0) {
            setStatus({ type: "error", msg: `Please wait ${fmt(cooldownLeft)} before resending.` });
            return;
        }

        setCode("");
        restartOtpTimer();
        startCooldown();

        if (flow === "signup") {
            const { error } = await supabase.auth.resend({ type: "signup", email });
            if (error) {
                setStatus({ type: "error", msg: error.message });
                setCooldownLeft(0);
            } else {
                setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
            }
        } else {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                setStatus({ type: "error", msg: error.message });
                setCooldownLeft(0);
            } else {
                setStatus({ type: "ok", msg: "Code resent. Check your inbox." });
            }
        }
    };

    if (email === null) {
        return (
            <div className="text-center">
                <div className="animate-pulse text-white/45">Loading…</div>
            </div>
        );
    }

    const resendDisabled = cooldownLeft > 0;
    const verifyDisabled = loading || code.replace(/\D/g, "").length !== 8;

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
                {flow === "signup" ? "Verify your email" : "Enter reset code"}
            </h1>

            <p className="mt-6 text-base text-white/60">
                We sent a verification code to{" "}
                <span className="font-medium text-white/85">{email}</span>.
            </p>

            <div className="mt-10 space-y-4">
                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••••••"
                    className={[
                        "w-full rounded-2xl border bg-white/5 backdrop-blur px-4 py-3.5 text-center",
                        "text-[20px] font-mono tracking-[0.20em] text-white outline-none transition",
                        "placeholder:text-white/30",
                        "border-white/10 focus:border-white/25 focus:ring-2 focus:ring-white/10",
                    ].join(" ")}
                />

                <div className="flex items-center justify-between text-xs text-white/45">
          <span>
            Code expires in <span className="text-white/65">{fmt(expiresLeft)}</span>
          </span>
                    <span>
            {resendDisabled ? (
                <>
                    Resend available in <span className="text-white/65">{fmt(cooldownLeft)}</span>
                </>
            ) : (
                "You can resend now"
            )}
          </span>
                </div>

                <button
                    type="button"
                    onClick={verify}
                    disabled={verifyDisabled}
                    className="w-full rounded-2xl bg-[#11A97D] py-3.5 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                >
                    {loading ? "Verifying…" : "Verify"}
                </button>

                <button
                    type="button"
                    onClick={resend}
                    disabled={resendDisabled}
                    className="w-full rounded-2xl border border-white/12 bg-white/5 backdrop-blur py-3.5 text-[15px] font-medium text-white/85 transition hover:bg-white/8 disabled:opacity-40"
                >
                    {resendDisabled ? `Resend code (${fmt(cooldownLeft)})` : "Resend code"}
                </button>

                {status && (
                    <p className={status.type === "ok" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
                        {status.msg}
                    </p>
                )}
            </div>

            <p className="mt-10 text-sm text-white/40">
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
                    <div className="animate-pulse text-white/45">Loading…</div>
                </div>
            }
        >
            <VerifyCodeInner />
        </Suspense>
    );
}