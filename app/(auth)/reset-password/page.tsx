"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

type Step = "checking" | "form" | "error" | "success";

function readHash() {
    const hash = window.location.hash || "";
    const p = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        access_token: p.get("access_token"),
        refresh_token: p.get("refresh_token"),
        error: p.get("error"),
        error_code: p.get("error_code"),
        error_description: p.get("error_description"),
    };
}

export default function ResetPasswordPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onChange",
    });

    const [step, setStep] = useState<Step>("checking");
    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    // 1) при заходе — ставим сессию из reset-ссылки
    useEffect(() => {
        (async () => {
            const h = readHash();

            // Supabase может вернуть ошибку прямо в hash
            if (h.error) {
                const msg =
                    h.error_code === "otp_expired"
                        ? "This reset link has expired. Please request a new one."
                        : h.error_description || "Reset link is invalid.";
                setStatus({ type: "error", msg });
                setStep("error");
                return;
            }

            // Должны быть токены в hash
            if (!h.access_token || !h.refresh_token) {
                setStatus({
                    type: "error",
                    msg: "This reset link is missing data or has already been used. Please request a new one.",
                });
                setStep("error");
                return;
            }

            // Устанавливаем сессию → только после этого можно updateUser
            const { error } = await supabase.auth.setSession({
                access_token: h.access_token,
                refresh_token: h.refresh_token,
            });

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

            setStep("form");
        })();
    }, []);

    // UX: если после ошибки пользователь начинает печатать — чистим статус
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    useEffect(() => {
        if (status?.type === "error" && step === "form") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password, confirmPassword]);

    const onSubmit = async (values: ResetPasswordValues) => {
        setStatus(null);

        const { error } = await supabase.auth.updateUser({
            password: values.password,
        });

        if (error) {
            setStatus({ type: "error", msg: error.message });
            return;
        }

        // опционально: разлогинить, чтобы не было “автологина назад”
        await supabase.auth.signOut();

        setStatus({ type: "ok", msg: "Password updated. Redirecting to login…" });
        setStep("success");

        setTimeout(() => {
            router.replace("/login");
            router.refresh();
        }, 800);
    };

    // --- UI states

    if (step === "checking") {
        return (
            <>
                <h1 className="text-2xl font-semibold tracking-tight text-black">Preparing reset…</h1>
                <p className="mt-4 text-sm text-black/55">Please wait.</p>

                <div className="mt-8 space-y-4 animate-pulse">
                    <div className="h-4 w-3/4 rounded bg-black/10" />
                    <div className="h-10 w-full rounded-2xl bg-black/10" />
                </div>
            </>
        );
    }

    if (step === "error") {
        return (
            <>
                <h1 className="text-2xl font-semibold tracking-tight text-black">Reset failed</h1>
                <p className="mt-4 text-sm text-red-600">{status?.msg}</p>

                <div className="mt-8 space-y-3">
                    <a
                        href="/forgot-password"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
                    >
                        Request a new reset link
                    </a>

                    <a
                        href="/login"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white py-3.5 text-[15px] font-medium text-black hover:bg-black/5 transition"
                    >
                        Back to login
                    </a>
                </div>
            </>
        );
    }

    // step === "form" | "success"
    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Set new password</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                Choose a new password for your account.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">New password</label>
                    <input
                        type="password"
                        placeholder="Minimum 8 characters"
                        className={[
                            "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                            "placeholder:text-black/35",
                            "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            errors.password ? "border-red-400/80" : "border-black/10",
                        ].join(" ")}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">Confirm new password</label>
                    <input
                        type="password"
                        placeholder="Repeat your password"
                        className={[
                            "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                            "placeholder:text-black/35",
                            "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            errors.confirmPassword ? "border-red-400/80" : "border-black/10",
                        ].join(" ")}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting || step === "success"}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Saving…" : "Update password"}
                </button>

                {status && (
                    <p className={["text-sm text-center", status.type === "ok" ? "text-black" : "text-red-600"].join(" ")}>
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-black/55">
                    Back to{" "}
                    <a className="text-black hover:underline" href="/login">
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
}