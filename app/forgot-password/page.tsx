"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators";
import { Logo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
        mode: "onChange",
    });

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const onSubmit = async (values: ForgotPasswordValues) => {
        setStatus(null);
        await new Promise((r) => setTimeout(r, 800));
        console.log("forgot-password:", values);

        setStatus({
            type: "ok",
            msg: "If this email exists, we’ll send you a reset link.",
        });
    };

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-[radial-gradient(1200px_800px_at_20%_20%,#EAF7FF_0%,transparent_60%),radial-gradient(900px_700px_at_80%_30%,#F2FBF7_0%,transparent_55%),linear-gradient(180deg,#FFFFFF_0%,#F2FBF7_40%,#EAF7FF_100%)]">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-10 flex items-center justify-center">
                    <a
                        href="https://s3-final.webflow.io/"
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center cursor-pointer transition duration-200 ease-out text-black/70 hover:text-black/40 focus:outline-none focus-visible:outline-none"
                    >
                        <Logo className="h-14 w-14" />
                    </a>
                </div>

                {/* Card */}
                <div
                    className={[
                        "rounded-[28px] border border-black/10 bg-white/55 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10",
                        shouldShake ? "gc-shake" : "",
                    ].join(" ")}
                >
                    <h1 className="text-4xl font-semibold tracking-tight text-black">
                        Reset password
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-black/55">
                        Enter your email and we’ll send you a reset link.
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
                            {isSubmitting ? "Sending…" : "Send reset link"}
                        </button>

                        {status && (
                            <p className={["text-sm text-center", status.type === "ok" ? "text-emerald-600" : "text-red-600"].join(" ")}>
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
            </div>
        </main>
    );
}