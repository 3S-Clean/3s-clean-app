"use client";

import {useEffect, useMemo, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AUTH_CARD_BASE} from "@/shared/ui";
import {createClient} from "@/shared/lib/supabase/client";
import {signupEmailSchema, type SignupEmailValues} from "@/shared/lib/auth/validators";
import {useBookingStore} from "@/features/booking/lib/store";
import {BookingDetectedCard} from "@/features/auth/components";

export default function SignupClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations("auth.signup");

    const supabase = useMemo(() => createClient(), []);
    const {resetBooking} = useBookingStore();

    const prefillEmail = sp.get("email") || "";
    const pendingOrderToken = sp.get("pendingOrder") || "";

    // locale-aware hrefs for /en/* and /de/*
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors, isSubmitting, isValid, submitCount},
    } = useForm<SignupEmailValues>({
        resolver: zodResolver(signupEmailSchema),
        defaultValues: {email: prefillEmail},
        mode: "onChange",
    });

    // if query email changes — update field
    useEffect(() => {
        if (prefillEmail) setValue("email", prefillEmail, {shouldValidate: true});
    }, [prefillEmail, setValue]);

    const [status, setStatus] = useState<null | { type: "ok" | "error"; msg: string }>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;

    const email = watch("email");

    useEffect(() => {
        if (status?.type === "error") setStatus(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const onSubmit = async (values: SignupEmailValues) => {
        setStatus(null);

        const {error} = await supabase.auth.signInWithOtp({
            email: values.email,
            options: {shouldCreateUser: true},
        });

        if (error) {
            const low = (error.message || "").toLowerCase();
            const msg =
                low.includes("already registered") ||
                low.includes("already exists") ||
                low.includes("duplicate") ||
                low.includes("already")
                    ? t("errors.alreadyRegistered")
                    : error.message;

            setStatus({type: "error", msg});
            return;
        }

        try {
            localStorage.setItem("pendingEmail", values.email);
            if (pendingOrderToken) localStorage.setItem("pendingOrderToken", pendingOrderToken);
        } catch {
        }

        // if pendingOrder exists — booking is already in orders, can reset store
        if (pendingOrderToken) resetBooking();

        const qs = new URLSearchParams();
        qs.set("flow", "signup");
        qs.set("email", values.email);
        if (pendingOrderToken) qs.set("pendingOrder", pendingOrderToken);

        router.replace(withLocale(`/verify-code?${qs.toString()}`));
    };

    return (
        <div className={[shouldShake ? "gc-shake" : "", "space-y-6"].filter(Boolean).join(" ")}>
            {/* main signup card content */}
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">{t("title")}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">{t("subtitle")}</p>
            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[color:var(--muted)]">{t("labels.email")}</label>
                    <input
                        type="email"
                        placeholder={t("placeholders.email")}
                        className={[
                            "w-full",
                            AUTH_CARD_BASE,
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
                        "bg-gray-900 dark:bg-white text-white dark:text-gray-900",
                        "hover:opacity-90",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {isSubmitting ? t("cta.loading") : t("cta.default")}
                </button>

                {status && (
                    <p className={["text-sm", status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90"].join(" ")}>
                        {status.msg}
                    </p>
                )}
                <p className="pt-2 text-center text-sm text-[color:var(--muted)]">
                    {t("footer.haveAccount")}{" "}
                    <a
                        className="text-[color:var(--text)] hover:underline cursor-pointer"
                        href={
                            pendingOrderToken
                                ? withLocale(`/login?pendingOrder=${encodeURIComponent(pendingOrderToken)}`)
                                : withLocale("/login")
                        }
                    >
                        {t("footer.login")}
                    </a>
                </p>
            </form>
            {/* ✅ separate card UNDER the signup card */}
            {pendingOrderToken ? <BookingDetectedCard text={t("bookingDetected")}/> : null}
        </div>

    );
}
