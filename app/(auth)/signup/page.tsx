"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client"; // ✅ Изменено
import { signupSchema, type SignupValues } from "@/lib/validators";

export default function SignupClient() {
    const router = useRouter();
    const supabase = createClient(); // ✅ Добавлено

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const email = watch("email");
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    useEffect(() => {
        if (status?.type === "error") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password, confirmPassword]);

    const onSubmit = async (values: SignupValues) => {
        setStatus(null);

        const originRaw =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (typeof window !== "undefined" ? window.location.origin : "");
        const origin = originRaw.replace(/\/+$/, "");

        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                emailRedirectTo: `${origin}/callback`,
            },
        });

        if (error) {
            const low = error.message.toLowerCase();
            const msg =
                low.includes("already registered") ||
                low.includes("already exists") ||
                low.includes("duplicate") ||
                low.includes("already")
                    ? "This email is already registered. Try logging in."
                    : error.message;

            setStatus({ type: "error", msg });
            return;
        }

        localStorage.setItem("pendingEmail", values.email);

        router.replace("/email-confirmed");
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Create account</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                Sign up to manage bookings and access your cleaning records.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">Email</label>
                    <input
                        type="email"
                        placeholder="name@domain.com"
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-black/70">Password</label>
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
                    <label className="text-sm font-medium text-black/70">Confirm password</label>
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
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating…" : "Sign up"}
                </button>

                {status && (
                    <p className={["text-sm text-center", status.type === "ok" ? "text-black" : "text-red-600"].join(" ")}>
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-black/55">
                    Already have an account?{" "}
                    <a className="text-black hover:underline" href="/login">
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
}