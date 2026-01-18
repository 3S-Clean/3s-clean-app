"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkOrderToUser } from "@/lib/booking/actions";
import { useBookingStore } from "@/lib/booking/store";

type Step = "register" | "verify";

export default function RegisterPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const { reset: resetBooking } = useBookingStore();

    // поддерживаем оба варианта параметра, чтобы ничего не ломать
    const pendingOrderToken = (sp.get("pendingOrder") ?? sp.get("token") ?? "").trim();
    const prefillEmail = (sp.get("email") ?? "").trim();

    const supabase = useMemo(() => createClient(), []);

    const [email, setEmail] = useState(prefillEmail);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<Step>("register");

    const doLinkAndRedirect = useCallback(async () => {
        if (!pendingOrderToken) {
            router.push("/account");
            return;
        }

        try {
            const orderId = await linkOrderToUser(pendingOrderToken); // ✅ string orderId
            resetBooking();
            router.replace(`/booking/success?orderId=${encodeURIComponent(orderId)}`); // ✅ orderId
        } catch {
            router.replace("/account/orders");
        }
    }, [pendingOrderToken, router, resetBooking]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // можно оставить — не мешает. но на привязку мы НЕ полагаемся.
                    data: { pending_order_token: pendingOrderToken || null },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
                return;
            }

            setStep("verify");
        } catch {
            setError("An error occurred. Please try again.");
        }

        setIsLoading(false);
    };

    const handleVerifiedClick = async () => {
        setIsLoading(true);
        setError("");

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setError("Please verify your email first");
                setIsLoading(false);
                return;
            }

            await doLinkAndRedirect();
        } catch {
            setError("An error occurred. Please try again.");
        }

        setIsLoading(false);
    };

    // Авто-привязка в момент, когда пользователь подтвердил email и реально залогинился
    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                await doLinkAndRedirect();
            }
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, [supabase, doLinkAndRedirect]);

    if (step === "verify") {
        return (
            <div>
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📧</div>
                    <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
                    <p className="text-[color:var(--muted)]">
                        We sent a verification link to <strong>{email}</strong>
                    </p>
                </div>

                <div
                    className="rounded-xl p-4 mb-6"
                    style={{
                        background: "color-mix(in oklab, var(--primary) 10%, transparent)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <p className="text-sm">
                        Click the link in your email to verify your account. Your booking will be automatically saved to your account.
                    </p>
                </div>

                {pendingOrderToken && (
                    <div
                        className="rounded-xl p-4 mb-6"
                        style={{
                            background: "color-mix(in oklab, #22c55e 12%, transparent)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <p className="text-sm">
                            ✓ Your booking is saved! It will appear in your order history after verification.
                        </p>
                    </div>
                )}

                <button
                    onClick={handleVerifiedClick}
                    disabled={isLoading}
                    className="w-full py-4 rounded-full font-medium transition-all disabled:opacity-50"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                    {isLoading ? "Checking..." : "I've verified my email"}
                </button>

                {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

                <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
                    Didn&apos;t receive the email?{" "}
                    <button
                        onClick={() => setStep("register")}
                        className="font-medium hover:underline"
                        style={{ color: "var(--foreground)" }}
                    >
                        Try again
                    </button>
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
                <p className="text-[color:var(--muted)]">
                    {pendingOrderToken ? "Complete registration to save your booking" : "Join 3S Clean to manage your bookings"}
                </p>
            </div>

            {pendingOrderToken && (
                <div
                    className="rounded-xl p-4 mb-6"
                    style={{
                        background: "color-mix(in oklab, #22c55e 12%, transparent)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <p className="text-sm">✓ Your booking is ready! Create an account to save it to your order history.</p>
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl outline-none border"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-xl outline-none border"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl outline-none border"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-full font-medium transition-all disabled:opacity-50"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                    {isLoading ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
                Already have an account?{" "}
                <a
                    href={`/auth/login${pendingOrderToken ? `?pendingOrder=${encodeURIComponent(pendingOrderToken)}` : ""}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--foreground)" }}
                >
                    Sign in
                </a>
            </p>
        </div>
    );
}