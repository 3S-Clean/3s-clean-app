"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { loginSchema, type LoginValues } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";

type Status = null | { type: "ok" | "error"; msg: string };

export default function LoginClient() {
    const router = useRouter();
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<Status>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const onSubmit = async (values: LoginValues) => {
        setStatus(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            const msgLower = error.message.toLowerCase();
            const msg =
                msgLower.includes("email not confirmed") || msgLower.includes("not confirmed")
                    ? "Please confirm your email first. Check your inbox."
                    : msgLower.includes("invalid login credentials")
                        ? "Wrong email or password."
                        : error.message;

            setStatus({ type: "error", msg });
            return;
        }

        router.replace("/account");
        router.refresh();
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                Welcome back
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                Log in to manage bookings and access your cleaning records.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[color:var(--muted)]">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className={[
                            "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                            "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                            "placeholder:text-[color:var(--muted)]/70",
                            "focus:ring-2 focus:ring-[var(--ring)] focus:border-[color:var(--input-border)]",
                            errors.email ? "border-red-400/70" : "",
                        ].join(" ")}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-500/90">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[color:var(--muted)]">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className={[
                            "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                            "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                            "placeholder:text-[color:var(--muted)]/70",
                            "focus:ring-2 focus:ring-[var(--ring)] focus:border-[color:var(--input-border)]",
                            errors.password ? "border-red-400/70" : "",
                        ].join(" ")}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-red-500/90">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <a
                        href="/forgot-password"
                        className="text-sm text-[color:var(--muted)] hover:opacity-80 transition"
                    >
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={[
                        "w-full rounded-2xl py-3.5 text-[15px] font-medium transition disabled:opacity-40 disabled:cursor-not-allowed",
                        "bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90",
                    ].join(" ")}
                >
                    {isSubmitting ? "Logging in…" : "Log in"}
                </button>

                {status && (
                    <p
                        className={[
                            "text-sm",
                            status.type === "ok"
                                ? "text-[color:var(--status-ok)]"
                                : "text-red-500/90",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-[color:var(--muted)]">
                    Don&apos;t have an account?{" "}
                    <a className="text-[color:var(--text)] hover:underline" href="/signup">
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}