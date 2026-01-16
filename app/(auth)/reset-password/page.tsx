"use client";

export const dynamic = "force-dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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

    const resolvedRef = useRef(false);

    const [queryFlow, setQueryFlow] = useState<string | null>(null);

    useEffect(() => {
        try {
            const v = new URLSearchParams(window.location.search).get("flow");
            setQueryFlow(v);
        } catch {
            setQueryFlow(null);
        }
    }, []);

    const hasRecoveryFlag = () => {
        try {
            return sessionStorage.getItem("recoveryFlow") === "1";
        } catch {
            return false;
        }
    };

    const clearRecoveryFlag = () => {
        try {
            sessionStorage.removeItem("recoveryFlow");
        } catch {}
    };

    useEffect(() => {
        if (queryFlow === null) return;

        let cancelled = false;

        const fail = (msg: string) => {
            if (cancelled) return;
            if (resolvedRef.current) return;
            resolvedRef.current = true;
            setStatus({ type: "error", msg });
            setStep("error");
        };

        const succeed = () => {
            if (cancelled) return;
            if (resolvedRef.current) return;
            resolvedRef.current = true;
            setStep("form");
        };

        if (queryFlow !== "recovery" || !hasRecoveryFlag()) {
            fail("This reset flow is not active. Please request a new reset code.");
            return () => {
                cancelled = true;
            };
        }

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (cancelled) return;
            if (session) succeed();
        });

        (async () => {
            for (let i = 0; i < 7; i++) {
                const { data } = await supabase.auth.getSession();
                if (cancelled) return;

                if (data.session) {
                    succeed();
                    return;
                }

                await new Promise((r) => setTimeout(r, 400));
            }

            fail("Your reset session is missing or expired. Please request a new reset code.");
        })();

        return () => {
            cancelled = true;
            sub?.subscription?.unsubscribe();
        };
    }, [supabase, queryFlow]);

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    useEffect(() => {
        if (status?.type === "error" && step === "form") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password, confirmPassword]);

    const onSubmit = async (values: ResetPasswordValues) => {
        setStatus(null);

        const { error } = await supabase.auth.updateUser({ password: values.password });
        if (error) {
            setStatus({ type: "error", msg: error.message });
            return;
        }

        clearRecoveryFlag();
        await supabase.auth.signOut();

        setStatus({ type: "ok", msg: "Password updated. Please log in with your new password." });
        setStep("success");

        setTimeout(() => {
            router.replace("/login");
        }, 600);
    };

    if (step === "checking") {
        return (
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Preparing reset…</h1>
                <p className="mt-4 text-sm text-white/60">Please wait.</p>

                <div className="mt-8 space-y-4 animate-pulse">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-10 w-full rounded-2xl bg-white/10" />
                </div>
            </div>
        );
    }

    if (step === "error") {
        return (
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Reset failed</h1>
                <p className="mt-4 text-sm text-red-400">{status?.msg}</p>

                <div className="mt-8 space-y-3">
                    <Link
                        href="/forgot-password"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#11A97D] py-3.5 text-[15px] font-medium text-white transition hover:opacity-90"
                    >
                        Request a new reset code
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/5 backdrop-blur py-3.5 text-[15px] font-medium text-white/85 transition hover:bg-white/8"
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
                <h1 className="text-2xl font-semibold tracking-tight text-white">Password updated</h1>
                <p className="mt-4 text-sm text-white/60">{status?.msg ?? "Done."}</p>
            </div>
        );
    }

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Set new password</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">Choose a new password for your account.</p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-white/70">
                        New password
                    </label>

                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        className={[
                            "w-full rounded-2xl border bg-white/5 backdrop-blur px-4 py-3.5 text-[15px] text-white outline-none transition",
                            "placeholder:text-white/35",
                            "focus:ring-2 focus:ring-white/10 focus:border-white/25",
                            errors.password ? "border-red-400/70" : "border-white/10",
                        ].join(" ")}
                        {...register("password")}
                    />

                    {errors.password && (
                        <p className="text-sm text-red-400" role="alert">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">
                        Confirm new password
                    </label>

                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        className={[
                            "w-full rounded-2xl border bg-white/5 backdrop-blur px-4 py-3.5 text-[15px] text-white outline-none transition",
                            "placeholder:text-white/35",
                            "focus:ring-2 focus:ring-white/10 focus:border-white/25",
                            errors.confirmPassword ? "border-red-400/70" : "border-white/10",
                        ].join(" ")}
                        {...register("confirmPassword")}
                    />

                    {errors.confirmPassword && (
                        <p className="text-sm text-red-400" role="alert">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-[#11A97D] py-3.5 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Saving…" : "Update password"}
                </button>

                {status && (
                    <p
                        role="status"
                        className={[
                            "text-sm text-center",
                            status.type === "ok" ? "text-emerald-400" : "text-red-400",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-white/60">
                    Back to{" "}
                    <Link className="text-white hover:underline" href="/login">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}