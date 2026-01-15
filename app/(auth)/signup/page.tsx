"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import { signupEmailSchema, type SignupEmailValues } from "@/lib/validators";

export default function SignupClient() {
    const router = useRouter();
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<SignupEmailValues>({
        resolver: zodResolver(signupEmailSchema),
        defaultValues: { email: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const email = watch("email");

    useEffect(() => {
        if (status?.type === "error") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const onSubmit = async (values: SignupEmailValues) => {
        setStatus(null);

        const { error } = await supabase.auth.signInWithOtp({
            email: values.email,
            options: {
                shouldCreateUser: true,
            },
        });

        if (error) {
            const low = (error.message || "").toLowerCase();
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

        try {
            localStorage.setItem("pendingEmail", values.email);
        } catch {}

        router.replace("/verify-code?flow=signup");
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Sign Up</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                We sent a verification code to <span>{email}</span>
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

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Sending code…" : "Send code"}
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