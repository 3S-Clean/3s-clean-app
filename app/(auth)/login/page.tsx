"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { loginSchema, type LoginValues } from "@/lib/validators";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    // UX: если пользователь меняет поля после ошибки — убираем сообщение
    const email = watch("email");
    const password = watch("password");
    useEffect(() => {
        if (status?.type === "error") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password]);

    const onSubmit = async (values: LoginValues) => {
        setStatus(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            const msg =
                error.message.toLowerCase().includes("invalid login credentials")
                    ? "Wrong email or password."
                    : error.message;

            setStatus({ type: "error", msg });
            return;
        }

        setStatus({ type: "ok", msg: "Logged in successfully." });
        router.push("/account");
        router.refresh();
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Welcome back</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                Log in to manage bookings and access your cleaning records.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className={[
                            "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                            "placeholder:text-black/35",
                            "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            errors.email ? "border-red-400/80" : "border-black/10",
                        ].join(" ")}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                    <a href="/forgot-password" className="text-sm text-black/55 hover:text-black transition">
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Logging in…" : "Log in"}
                </button>

                {status && (
                    <p
                        className={[
                            "text-sm text-center",
                            status.type === "ok" ? "text-emerald-600" : "text-red-600",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-black/55">
                    Don&apos;t have an account?{" "}
                    <a className="text-black hover:underline" href="/signup">
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}