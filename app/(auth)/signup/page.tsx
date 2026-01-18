"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import { signupEmailSchema, type SignupEmailValues } from "@/lib/validators";
import { useBookingStore } from "@/lib/booking/store";

export default function SignupClient() {
    const router = useRouter();
    const sp = useSearchParams();

    const supabase = useMemo(() => createClient(), []);
    const { reset: resetBooking } = useBookingStore();

    const prefillEmail = sp.get("email") || "";
    const pendingOrderToken = sp.get("pendingOrder") || "";

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid, submitCount },
    } = useForm<SignupEmailValues>({
        resolver: zodResolver(signupEmailSchema),
        defaultValues: { email: prefillEmail },
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
            if (pendingOrderToken) localStorage.setItem("pendingOrderToken", pendingOrderToken);
        } catch {}

        // если есть pendingOrder — мы считаем букинг “сохранённым” и можем очистить локальный store
        if (pendingOrderToken) {
            resetBooking();
        }

        const qs = new URLSearchParams();
        qs.set("flow", "signup");
        if (pendingOrderToken) qs.set("pendingOrder", pendingOrderToken);
        qs.set("email", values.email);

        router.replace(`/verify-code?${qs.toString()}`);
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                Sign Up
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                Enter your email — we’ll send you a verification code.
                {pendingOrderToken ? (
                    <>
                        {" "}
                        <span className="text-[color:var(--text)]/90">
              Your booking will be saved to your account.
            </span>
                    </>
                ) : null}
            </p>

            {pendingOrderToken ? (
                <div className="mt-6 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)]/60 px-4 py-3 backdrop-blur">
                    <p className="text-sm text-[color:var(--muted)]">
                        ✓ Booking detected — after verification it will appear in your order history.
                    </p>
                </div>
            ) : null}

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
                    {isSubmitting ? "Sending code…" : "Send code"}
                </button>

                {status && (
                    <p
                        className={[
                            "text-sm",
                            status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}

                <p className="pt-2 text-center text-sm text-[color:var(--muted)]">
                    Already have an account?{" "}
                    <a
                        className="text-[color:var(--text)] hover:underline"
                        href={pendingOrderToken ? `/login?pendingOrder=${encodeURIComponent(pendingOrderToken)}` : "/login"}
                    >
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
}