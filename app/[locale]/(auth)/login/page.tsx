"use client";

import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {loginSchema, type LoginValues} from "@/lib/validators";
import {createClient} from "@/lib/supabase/client";
import {useBookingStore} from "@/lib/booking/store";
import Link from "next/link";
import {CARD_FRAME_BASE} from "@/components/ui/card/CardFrame";
import BookingDetectedCard from "@/components/auth/BookingDetectedCard";

type Status = null | { type: "ok" | "error"; msg: string };

export default function LoginClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations("auth.login");
    const supabase = useMemo(() => createClient(), []);
    const {resetBooking} = useBookingStore();
    const pendingOrderToken = sp.get("pendingOrder") || "";

    // locale-aware hrefs for /en/* and /de/*
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting, isValid, submitCount},
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: "", password: ""},
        mode: "onChange",
    });

    const [status, setStatus] = useState<Status>(null);
    const shouldShake = submitCount > 0 && Object.keys(errors).length > 0;
    const onSubmit = async (values: LoginValues) => {
        setStatus(null);
        const {error} = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            const msgLower = (error.message || "").toLowerCase();
            const msg =
                msgLower.includes("email not confirmed") || msgLower.includes("not confirmed")
                    ? t("status.confirmEmail")
                    : msgLower.includes("invalid login credentials")
                        ? t("status.wrongCredentials")
                        : error.message;

            setStatus({type: "error", msg});
            return;
        }
        // ✅ если юзер пришёл из booking с pendingOrder — линкуем и кидаем на success
        if (pendingOrderToken) {
            try {
                try {
                    localStorage.setItem("pendingOrderToken", pendingOrderToken);
                } catch {
                }

                const res = await fetch("/api/booking/link-order", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({pendingToken: pendingOrderToken}),
                });

                const json: { orderId?: string; error?: string } = await res.json().catch(() => ({}));

                resetBooking();
                try {
                    localStorage.removeItem("pendingOrderToken");
                } catch {
                }

                if (res.ok && json?.orderId) {
                    router.replace(withLocale(`/booking/success?orderId=${encodeURIComponent(String(json.orderId))}`));
                    router.refresh();
                    return;
                }

                router.replace(withLocale("/account/orders"));
                router.refresh();
                return;
            } catch {
                router.replace(withLocale("/account/orders"));
                router.refresh();
                return;
            }
        }

        router.replace(withLocale("/account"));
        router.refresh();
    };

    return (
        <div className={shouldShake ? "gc-shake" : ""}>
            {/* main login card content */}
            <div>
                <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                    {t("title")}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                    {t("subtitle")}
                </p>
                <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[color:var(--muted)]">{t("labels.email")}</label>
                        <input
                            type="email"
                            placeholder={t("placeholders.email")}
                            className={[
                                "w-full",
                                CARD_FRAME_BASE,
                                "rounded-2xl px-4 py-3.5 text-[16px]",
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[color:var(--muted)]">{t("labels.password")}</label>
                        <input
                            type="password"
                            placeholder={t("placeholders.password")}
                            className={[
                                "w-full",
                                CARD_FRAME_BASE,
                                "rounded-2xl px-4 py-3.5 text-[16px]",
                                "bg-transparent",
                                "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                                "outline-none transition-all duration-200",
                                "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                                "active:scale-[0.99]",
                                errors.password ? "ring-2 ring-red-400/50" : "",
                            ].join(" ")}
                            {...register("password")}
                        />
                        {errors.password && <p className="text-sm text-red-500/90">{errors.password.message}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <Link href={withLocale("/forgot-password")}
                              className="text-sm text-[color:var(--muted)] hover:opacity-80 transition">
                            {t("links.forgotPassword")}
                        </Link>
                    </div>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="
                        w-full rounded-3xl py-3.5 text-[15px] font-medium transition
                        bg-gray-900 dark:bg-white text-white dark:text-gray-900
                        hover:opacity-90
                        disabled:opacity-40 disabled:cursor-not-allowed
                    "
                    >
                        {isSubmitting ? t("cta.loading") : t("cta.default")}
                    </button>
                    {status && (
                        <p className={["text-sm", status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90"].join(" ")}>
                            {status.msg}
                        </p>
                    )}

                    <p className="pt-2 text-center text-sm text-[color:var(--muted)]">
                        {t("footer.noAccount")}{" "}
                        <a
                            className="text-[color:var(--text)] hover:underline cursor-pointer"
                            href={
                                pendingOrderToken
                                    ? withLocale(`/signup?pendingOrder=${encodeURIComponent(pendingOrderToken)}`)
                                    : withLocale("/signup")
                            }
                        >
                            {t("footer.signup")}
                        </a>
                    </p>
                </form>
            </div>
            {/* ✅ separate card UNDER the login card */}
            {pendingOrderToken ? <BookingDetectedCard text={t("bookingDetected")}/> : null}
        </div>
    );
}