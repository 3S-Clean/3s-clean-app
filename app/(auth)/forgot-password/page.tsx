"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";

type Status = null | { type: "ok" | "error"; msg: string };

export default function ForgotPasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<Status>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const email = watch("email");
    useEffect(() => {
        if (status?.type === "error") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const onSubmit = async (values: ForgotPasswordValues) => {
        setStatus(null);

        const cleanEmail = values.email.trim();

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

        if (error) {
            setStatus({ type: "error", msg: error.message });
            return;
        }

        try {
            localStorage.setItem("pendingResetEmail", cleanEmail);
        } catch {}

        router.replace("/verify-code?flow=recovery");
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                Reset password
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                Enter your email and we’ll send you a verification code.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[color:var(--muted)]">Email</label>
                    <input
                        type="email"
                        placeholder="name@domain.com"
                        className={[
                            "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                            "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                            "placeholder:text-[color:var(--muted)]/70",
                            "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                            errors.email ? "border-red-400/70" : "",
                        ].join(" ")}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-500/90">{errors.email.message}</p>}
                </div>

                {/* light чёрная, dark белая */}
                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={[
                        "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                        "disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90",
                        "bg-black text-white",
                        "dark:bg-white dark:text-black",
                    ].join(" ")}
                >
                    {isSubmitting ? "Sending…" : "Send code"}
                </button>

                {status && (
                    <p
                        className={[
                            "text-sm text-center",
                            status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-[color:var(--muted)]">
                    Back to{" "}
                    <a className="text-[color:var(--text)] hover:underline" href="/login">
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
}