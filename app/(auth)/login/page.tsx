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
            <h1 className="text-4xl font-semibold tracking-tight text-white">
                Welcome back
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
                Log in to manage bookings and access your cleaning records.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className={[
                            "w-full rounded-2xl border bg-white/5 backdrop-blur px-4 py-3.5 text-[15px] text-white outline-none transition",
                            "placeholder:text-white/35",
                            "focus:ring-2 focus:ring-white/10 focus:border-white/25",
                            errors.email ? "border-red-400/70" : "border-white/10",
                        ].join(" ")}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className={[
                            "w-full rounded-2xl border bg-white/5 backdrop-blur px-4 py-3.5 text-[15px] text-white outline-none transition",
                            "placeholder:text-white/35",
                            "focus:ring-2 focus:ring-white/10 focus:border-white/25",
                            errors.password ? "border-red-400/70" : "border-white/10",
                        ].join(" ")}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <a
                        href="/forgot-password"
                        className="text-sm text-white/60 hover:text-white transition"
                    >
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-[#11A97D] py-3.5 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Logging in…" : "Log in"}
                </button>

                {status && (
                    <p className={["text-sm text-center", status.type === "ok" ? "text-white" : "text-red-400"].join(" ")}>
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-white/60">
                    Don&apos;t have an account?{" "}
                    <a className="text-white hover:underline" href="/signup">
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}