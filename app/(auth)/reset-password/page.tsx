"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

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

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    // UX: если после ошибки пользователь начинает печатать — чистим статус
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    useEffect(() => {
        if (status?.type === "error") setStatus(null);
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

        setStatus({ type: "ok", msg: "Password updated. Redirecting…" });

        // чуть подождём для UX, потом на логин
        setTimeout(() => {
            router.push("/login");
            router.refresh();
        }, 600);
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Set new password</h1>
            <p className="mt-3 text-sm leading-relaxed text-black/55">
                Choose a new password for your account.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* New password */}
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

                {/* Confirm */}
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
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                        className={[
                            "text-sm text-center",
                            status.type === "ok" ? "text-emerald-600" : "text-red-600",
                        ].join(" ")}
                    >
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