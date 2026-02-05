"use client";

export const dynamic = "force-dynamic";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CARD_FRAME_BASE} from "@/components/ui/card/CardFrame";
import {forgotPasswordSchema, type ForgotPasswordValues} from "@/lib/validators";
import {createClient} from "@/lib/supabase/client";
import Link from "next/link";

type Status = null | { type: "ok" | "error"; msg: string };

export default function ForgotPasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors, isSubmitting, isValid, submitCount},
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {email: ""},
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

        const cleanEmail = values.email.trim().toLowerCase();

        const {error} = await supabase.auth.resetPasswordForEmail(cleanEmail);

        if (error) {
            setStatus({type: "error", msg: error.message});
            return;
        }

        try {
            localStorage.setItem("pendingResetEmail", cleanEmail);
        } catch {
        }

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
                            "w-full",
                            CARD_FRAME_BASE,
                            "rounded-2xl px-4 py-3.5 text-[15px]",
                            "bg-transparent",
                            "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                            "outline-none transition-all duration-200",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                            "active:scale-[0.99]",
                            errors.email ? "ring-2 ring-red-400/50" : "",
                        ].join(" ")}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-500/90">{errors.email.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={[
                        "w-full rounded-3xl py-3.5 text-[15px] font-medium transition",
                        "disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90",
                        "bg-gray-900 dark:bg-white text-white dark:text-gray-900",
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
                    <Link className="text-[color:var(--text)] hover:underline" href="/login">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}