"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

type Step = "checking" | "form" | "error" | "success";
type Status = { type: "ok" | "error"; msg: string } | null;

interface HashParams {
    access_token: string | null;
    refresh_token: string | null;
    type: string | null;
    error: string | null;
    error_code: string | null;
    error_description: string | null;
}

function readHash(): HashParams {
    const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        type: params.get("type"),
        error: params.get("error"),
        error_code: params.get("error_code"),
        error_description: params.get("error_description"),
    };
}

function readQuery() {
    const qs = typeof window !== "undefined" ? window.location.search || "" : "";
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    return {
        token_hash: params.get("token_hash"),
        type: params.get("type"),
        error: params.get("error"),
        error_code: params.get("error_code"),
        error_description: params.get("error_description"),
    };
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, submitCount },
        watch,
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onChange",
    });

    const [step, setStep] = useState<Step>("checking");
    const [status, setStatus] = useState<Status>(null);

    const shouldShake = submitCount > 0 && !isValid;

    // 1) Init session:
    // A) ?token_hash=... -> verifyOtp (лучшее, не сгорает от превью)
    // B) #access_token... -> setSession (fallback)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            // --- token_hash flow (query)
            const qp = readQuery();

            if (qp.error) {
                const msg =
                    qp.error_code === "otp_expired"
                        ? "This reset link has expired. Please request a new one."
                        : qp.error_description || "Reset link is invalid.";

                if (!cancelled) {
                    setStatus({ type: "error", msg });
                    setStep("error");
                }
                return;
            }

            if (qp.token_hash) {
                if (qp.type && qp.type !== "recovery") {
                    if (!cancelled) {
                        setStatus({
                            type: "error",
                            msg: "Invalid reset link type. Please request a new password reset.",
                        });
                        setStep("error");
                    }
                    return;
                }

                const { error } = await supabase.auth.verifyOtp({
                    type: "recovery",
                    token_hash: qp.token_hash,
                });

                if (cancelled) return;

                if (error) {
                    const low = (error.message || "").toLowerCase();
                    setStatus({
                        type: "error",
                        msg: low.includes("expired")
                            ? "This reset link has expired. Please request a new one."
                            : error.message || "Reset link is invalid.",
                    });
                    setStep("error");
                    return;
                }

                // очистили URL
                window.history.replaceState(null, "", window.location.pathname);
                setStep("form");
                return;
            }

            // --- fallback: hash flow
            const hp = readHash();

            if (hp.error) {
                const msg =
                    hp.error_code === "otp_expired"
                        ? "This reset link has expired. Please request a new one."
                        : hp.error_description || "Reset link is invalid.";

                if (!cancelled) {
                    setStatus({ type: "error", msg });
                    setStep("error");
                }
                return;
            }

            if (!hp.access_token || !hp.refresh_token) {
                if (!cancelled) {
                    setStatus({
                        type: "error",
                        msg: "This reset link is missing data or has already been used. Please request a new one.",
                    });
                    setStep("error");
                }
                return;
            }

            if (hp.type && hp.type !== "recovery") {
                if (!cancelled) {
                    setStatus({
                        type: "error",
                        msg: "Invalid reset link type. Please request a new password reset.",
                    });
                    setStep("error");
                }
                return;
            }

            const { error } = await supabase.auth.setSession({
                access_token: hp.access_token,
                refresh_token: hp.refresh_token,
            });

            if (cancelled) return;

            if (error) {
                const low = error.message.toLowerCase();
                setStatus({
                    type: "error",
                    msg: low.includes("expired")
                        ? "This reset link has expired. Please request a new one."
                        : error.message,
                });
                setStep("error");
                return;
            }

            // очистили URL
            window.history.replaceState(null, "", window.location.pathname);
            setStep("form");
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    // 2) если пользователь начал вводить — чистим статус
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    useEffect(() => {
        if (status?.type === "error" && step === "form") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password, confirmPassword]);

    // 3) update password
    const onSubmit = async (values: ResetPasswordValues) => {
        setStatus(null);

        const { error } = await supabase.auth.updateUser({
            password: values.password,
        });

        if (error) {
            setStatus({ type: "error", msg: error.message });
            return;
        }

        // автологаут
        await supabase.auth.signOut();

        setStatus({
            type: "ok",
            msg: "Password updated. Please log in with your new password.",
        });
        setStep("success");

        router.replace("/login");
        router.refresh();
    };

    if (step === "checking") {
        return (
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-black">Preparing reset…</h1>
                <p className="mt-4 text-sm text-black/55">Please wait.</p>

                <div className="mt-8 space-y-4 animate-pulse">
                    <div className="h-4 w-3/4 rounded bg-black/10" />
                    <div className="h-10 w-full rounded-2xl bg-black/10" />
                </div>
            </div>
        );
    }

    if (step === "error") {
        return (
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-black">Reset failed</h1>
                <p className="mt-4 text-sm text-red-600">{status?.msg}</p>

                <div className="mt-8 space-y-3">
                    <Link
                        href="/forgot-password"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
                    >
                        Request a new reset link
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white py-3.5 text-[15px] font-medium text-black hover:bg-black/5 transition"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-black">Password updated</h1>
                <p className="mt-4 text-sm text-black/55">{status?.msg ?? "Done."}</p>
            </div>
        );
    }

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Set new password</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                Choose a new password for your account.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-black/70">
                        New password
                    </label>

                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        className={[
                            "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                            "placeholder:text-black/35",
                            "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            errors.password ? "border-red-400/80" : "border-black/10",
                        ].join(" ")}
                        {...register("password")}
                    />

                    {errors.password && (
                        <p className="text-sm text-red-600" role="alert">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-black/70">
                        Confirm new password
                    </label>

                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        className={[
                            "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                            "placeholder:text-black/35",
                            "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            errors.confirmPassword ? "border-red-400/80" : "border-black/10",
                        ].join(" ")}
                        {...register("confirmPassword")}
                    />

                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600" role="alert">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Saving…" : "Update password"}
                </button>

                {status && (
                    <p
                        role="status"
                        className={[
                            "text-sm text-center",
                            status.type === "ok" ? "text-black" : "text-red-600",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-black/55">
                    Back to{" "}
                    <Link className="text-black hover:underline" href="/login">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}