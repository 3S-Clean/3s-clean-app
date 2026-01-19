"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBookingStore } from "@/lib/booking/store";

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

    const flow: Flow = sp.get("flow") === "recovery" ? "recovery" : "signup";
    const pendingOrderFromQuery = useMemo(() => sp.get("pendingOrder") || "", [sp]);

    const supabase = useMemo(() => createClient(), []);
    const { resetBooking } = useBookingStore();

    const [pendingOrderToken, setPendingOrderToken] = useState<string>(pendingOrderFromQuery);

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
        const storedEmail = (() => {
            try {
                return localStorage.getItem(storageKey);
            } catch {
                return null;
            }
        })();

        if (!storedEmail) {
            router.replace(flow === "signup" ? "/signup" : "/forgot-password");
            return;
        }

        setEmail(storedEmail);
        restartOtpTimer();

        // signup: pendingOrder token (query or localStorage)
        if (flow === "signup") {
            if (pendingOrderFromQuery) {
                setPendingOrderToken(pendingOrderFromQuery);
                try {
                    localStorage.setItem("pendingOrderToken", pendingOrderFromQuery);
                } catch {}
            } else {
                const storedToken = (() => {
                    try {
                        return localStorage.getItem("pendingOrderToken");
                    } catch {
                        return null;
                    }
                })();
                if (storedToken) setPendingOrderToken(storedToken);
            }
        }
    }, [flow, router, storageKey, pendingOrderFromQuery]);

    useEffect(() => {
        if (!email) return;
        const id = window.setInterval(() => setExpiresLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => window.clearInterval(id);
    }, [email]);

    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const id = window.setInterval(() => setCooldownLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => window.clearInterval(id);
    }, [cooldownLeft]);

    async function waitForSession(maxAttempts = 7, delayMs = 250) {
        for (let i = 0; i < maxAttempts; i++) {
            const { data } = await supabase.auth.getSession();
            if (data.session) return data.session;
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return null;
    }

    const verify = async () => {
        if (loading) return;

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

            // recovery: ensure session exists before redirect to reset-password
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

            // ✅ signup + pendingOrder => link via API and redirect to booking success
            if (flow === "signup") {
                const tokenToLink = (pendingOrderToken || "").trim();

                if (tokenToLink) {
                    const res = await fetch("/api/booking/link-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ pendingToken: tokenToLink }),
                    });

                    const json = await res.json();

                    // ❗ link-order returns { orderId }
                    if (!res.ok || !json?.orderId) {
                        try {
                            localStorage.removeItem("pendingOrderToken");
                        } catch {}
                        try {
                            localStorage.removeItem(storageKey);
                        } catch {}
                        router.replace("/account/orders");
                        return;
                    }

                    resetBooking();

                    try {
                        localStorage.removeItem("pendingOrderToken");
                    } catch {}
                    try {
                        localStorage.removeItem(storageKey);
                    } catch {}

                    router.replace(`/booking/success?orderId=${encodeURIComponent(String(json.orderId))}`);
                    return;
                }
            }

            try {
                localStorage.removeItem(storageKey);
            } catch {}

            if (flow === "signup") router.replace("/set-password");
            else router.replace("/reset-password?flow=recovery&recovery=1");
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
                <div className="animate-pulse text-[color:var(--muted)]">Loading…</div>
            </div>
        );
    }

    const resendDisabled = cooldownLeft > 0;
    const verifyDisabled = loading || code.replace(/\D/g, "").length !== 8;

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                {flow === "signup" ? "Verify your email" : "Enter reset code"}
            </h1>

            <p className="mt-6 text-base text-[color:var(--muted)]">
                We sent a verification code to <span className="font-medium text-[color:var(--text)]/90">{email}</span>.
            </p>

            {flow === "signup" && pendingOrderToken ? (
                <div className="mt-6 rounded-2xl border bg-[var(--input-bg)] border-[var(--input-border)] px-4 py-3 backdrop-blur">
                    <p className="text-sm text-[color:var(--muted)]">✓ Booking detected — after verification it will be linked to your account.</p>
                </div>
            ) : null}

            <div className="mt-10 space-y-4">
                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••••••"
                    className={[
                        "w-full rounded-2xl border px-4 py-3.5 text-center outline-none transition backdrop-blur",
                        "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                        "text-[20px] font-mono tracking-[0.20em]",
                        "placeholder:text-[color:var(--muted)]/60",
                        "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                    ].join(" ")}
                />

                <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>
            Code expires in <span className="text-[color:var(--text)]/70">{fmt(expiresLeft)}</span>
          </span>
                    <span>
            {resendDisabled ? (
                <>
                    Resend available in <span className="text-[color:var(--text)]/70">{fmt(cooldownLeft)}</span>
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
                    className={[
                        "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                        "disabled:opacity-40 hover:opacity-90",
                        "bg-black text-white",
                        "dark:bg-white dark:text-black",
                    ].join(" ")}
                >
                    {loading ? "Verifying…" : "Verify"}
                </button>

                <button
                    type="button"
                    onClick={resend}
                    disabled={resendDisabled}
                    className={[
                        "w-full rounded-2xl border py-3.5 text-[15px] font-medium transition disabled:opacity-40",
                        "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                        "backdrop-blur hover:opacity-90",
                    ].join(" ")}
                >
                    {resendDisabled ? `Resend code (${fmt(cooldownLeft)})` : "Resend code"}
                </button>

                {status && (
                    <p className={["text-sm", status.type === "ok" ? "text-black dark:text-white" : "text-red-500/90"].join(" ")}>
                        {status.msg}
                    </p>
                )}
            </div>

            <p className="mt-10 text-sm text-[color:var(--muted)]">If you entered the wrong email, go back and try again.</p>
        </div>
    );
}

export default function VerifyCodePage() {
    return (
        <Suspense
            fallback={
                <div className="text-center">
                    <div className="animate-pulse text-[color:var(--muted)]">Loading…</div>
                </div>
            }
        >
            <VerifyCodeInner />
        </Suspense>
    );
}