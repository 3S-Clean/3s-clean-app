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

    // 1) Проверяем, что есть session (она появляется после verify-code)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data } = await supabase.auth.getSession();
            if (cancelled) return;

            if (!data.session) {
                setStatus({
                    type: "error",
                    msg: "Your reset session is missing or expired. Please request a new reset code.",
                });
                setStep("error");
                return;
            }

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

        // автологаут (как у тебя было)
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
                        Request a new reset code
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