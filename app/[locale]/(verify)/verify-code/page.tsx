"use client";

export const dynamic = "force-dynamic";

import {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {createClient} from "@/shared/lib/supabase/client";
import {useBookingStore} from "@/features/booking/lib/store";
import {z} from "zod";
import {BookingDetectedCard, OtpBoxes} from "@/features/auth/components";

type Flow = "signup" | "recovery";
const OTP_TTL_SEC = 600; // 10 minutes
const RESEND_COOLDOWN_SEC = 120; // 2 minutes

function fmt(sec: number) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

// ✅ Zod runtime-guard for link-order response
const LinkOrderResponseSchema = z.union([
    z.object({orderId: z.string().min(1)}),
    z.object({error: z.string().min(1)}),
]);
type LinkOrderResponse = z.infer<typeof LinkOrderResponseSchema>;

function VerifyCodeInner() {
    const router = useRouter();
    const sp = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations("auth.verifyCode");

    const flow: Flow = sp.get("flow") === "recovery" ? "recovery" : "signup";
    const pendingOrderFromQuery = useMemo(() => sp.get("pendingOrder") || "", [sp]);
    const supabase = useMemo(() => createClient(), []);
    const {resetBooking} = useBookingStore();

    const [pendingOrderToken, setPendingOrderToken] = useState<string>(pendingOrderFromQuery);
    const [email, setEmail] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<null | { type: "error" | "ok"; msg: string }>(null);
    const [loading, setLoading] = useState(false);
    // ✅ show CTA instead of silent redirect when link-order fails
    const [showOrdersCta, setShowOrdersCta] = useState(false);
    const [expiresLeft, setExpiresLeft] = useState<number>(OTP_TTL_SEC);
    const [cooldownLeft, setCooldownLeft] = useState<number>(0);

    const restartOtpTimer = () => setExpiresLeft(OTP_TTL_SEC);
    const startCooldown = () => setCooldownLeft(RESEND_COOLDOWN_SEC);

    const storageKey = flow === "recovery" ? "pendingResetEmail" : "pendingEmail";

    // locale-aware paths (/en/*, /de/*)
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = useCallback(
        (href: string) => (hasLocale ? `/${locale}${href}` : href),
        [hasLocale, locale]
    );

    useEffect(() => {
        const storedEmail = (() => {
            try {
                return localStorage.getItem(storageKey);
            } catch {
                return null;
            }
        })();

        if (!storedEmail) {
            router.replace(withLocale(flow === "signup" ? "/signup" : "/forgot-password"));
            return;
        }

        setEmail(storedEmail);
        restartOtpTimer();

        // signup: pendingOrder token (query or localStorage)
        if (flow === "signup") {
            if (pendingOrderFromQuery) {
                setPendingOrderToken(pendingOrderFromQuery);
                try {
                    localStorage.setItem("pendingOrderToken", pendingOrderFromQuery);
                } catch {
                }
            } else {
                const storedToken = (() => {
                    try {
                        return localStorage.getItem("pendingOrderToken");
                    } catch {
                        return null;
                    }
                })();
                if (storedToken) setPendingOrderToken(storedToken);
            }
        }
    }, [flow, router, storageKey, pendingOrderFromQuery, withLocale]);

    useEffect(() => {
        if (!email) return;
        const id = window.setInterval(() => setExpiresLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => window.clearInterval(id);
    }, [email]);

    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const id = window.setInterval(() => setCooldownLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => window.clearInterval(id);
    }, [cooldownLeft]);

    async function waitForSession(maxAttempts = 7, delayMs = 250) {
        for (let i = 0; i < maxAttempts; i++) {
            const {data} = await supabase.auth.getSession();
            if (data.session) return data.session;
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return null;
    }

    const verify = async () => {
        if (loading) return;
        setStatus(null);
        setShowOrdersCta(false);
        setLoading(true);

        try {
            if (!email) {
                setStatus({type: "error", msg: t("errors.missingEmail")});
                return;
            }

            const token = code.replace(/\D/g, "").slice(0, 8);
            if (!/^\d{8}$/.test(token)) {
                setStatus({type: "error", msg: t("errors.invalidCode")});
                return;
            }

            if (expiresLeft <= 0) {
                setStatus({type: "error", msg: t("errors.expired")});
                return;
            }

            const {error} = await supabase.auth.verifyOtp({
                email,
                token,
                type: flow === "recovery" ? "recovery" : "signup",
            });

            if (error) {
                setStatus({type: "error", msg: error.message});
                return;
            }

            // recovery: ensure session exists before redirect to reset-password
            if (flow === "recovery") {
                const session = await waitForSession();
                if (!session) {
                    setStatus({type: "error", msg: t("errors.recoverySessionMissing")});
                    return;
                }
                try {
                    sessionStorage.setItem("recoveryFlow", "1");
                } catch {
                }
            }

            // ✅ signup + pendingOrder => link via API
            // ✅ then go to set-password, and only after that — continue to next (booking success)
            if (flow === "signup") {
                const tokenToLink = (pendingOrderToken || "").trim();

                if (tokenToLink) {
                    const res = await fetch("/api/booking/link-order", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({pendingToken: tokenToLink}),
                    });

                    // ✅ parse JSON safely (unknown), then validate with Zod
                    let raw: unknown = null;
                    try {
                        raw = await res.json();
                    } catch {
                        raw = null;
                    }

                    const parsed = LinkOrderResponseSchema.safeParse(raw);
                    if (!res.ok || !parsed.success || ("error" in parsed.data && !("orderId" in parsed.data))) {
                        console.error("link-order failed", {ok: res.ok, raw, parsed});

                        setStatus({
                            type: "ok",
                            msg: t("status.verifiedButNotLinked"),
                        });
                        setShowOrdersCta(true);
                        return;
                    }

                    const json: LinkOrderResponse = parsed.data;
                    if (!("orderId" in json)) {
                        setStatus({type: "ok", msg: t("status.verifiedButNotLinked")});
                        setShowOrdersCta(true);
                        return;
                    }

                    resetBooking();

                    try {
                        localStorage.removeItem("pendingOrderToken");
                    } catch {
                    }
                    try {
                        localStorage.removeItem(storageKey);
                    } catch {
                    }

                    // ✅ set password first, then continue to booking success
                    const nextUrl = withLocale(`/booking/success?orderId=${encodeURIComponent(json.orderId)}`);
                    router.replace(withLocale(`/set-password?next=${encodeURIComponent(nextUrl)}`));
                    return;
                }
            }

            try {
                localStorage.removeItem(storageKey);
            } catch {
            }

            if (flow === "signup") router.replace(withLocale("/set-password"));
            else router.replace(withLocale("/reset-password?flow=recovery&recovery=1"));
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setStatus(null);
        setShowOrdersCta(false);

        if (!email) {
            setStatus({type: "error", msg: t("errors.missingEmail")});
            return;
        }

        if (cooldownLeft > 0) {
            setStatus({type: "error", msg: t("errors.cooldown", {time: fmt(cooldownLeft)})});
            return;
        }

        setCode("");
        restartOtpTimer();
        startCooldown();

        if (flow === "signup") {
            const {error} = await supabase.auth.resend({type: "signup", email});
            if (error) {
                setStatus({type: "error", msg: error.message});
                setCooldownLeft(0);
            } else {
                setStatus({type: "ok", msg: t("status.resent")});
            }
        } else {
            const {error} = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                setStatus({type: "error", msg: error.message});
                setCooldownLeft(0);
            } else {
                setStatus({type: "ok", msg: t("status.resent")});
            }
        }
    };

    if (email === null) {
        return (
            <div className="text-center">
                <div className="animate-pulse text-[color:var(--muted)]">{t("loading")}</div>
            </div>
        );
    }

    const resendDisabled = cooldownLeft > 0;
    const verifyDisabled = loading || code.replace(/\D/g, "").length !== 8;

    return (
        <div className="space-y-6">
            {/* main auth card content */}
            <div className="text-center">
                <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                    {flow === "signup" ? t("titles.signup") : t("titles.recovery")}
                </h1>

                <p className="mt-6 text-base text-[color:var(--muted)]">
                    {t("sentPrefix")}{" "}
                    <span className="font-medium text-[color:var(--text)]/90">{email}</span>.
                </p>

                <div className="mt-10 space-y-4">
                    <OtpBoxes value={code} onChangeAction={setCode}/>
                    <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>
            {t("meta.expiresPrefix")}{" "}
              <span className="text-[color:var(--text)]/70">{fmt(expiresLeft)}</span>
          </span>
                        <span>
            {resendDisabled ? (
                <>
                    {t("meta.resendInPrefix")}{" "}
                    <span className="text-[color:var(--text)]/70">{fmt(cooldownLeft)}</span>
                </>
            ) : (
                t("meta.resendNow")
            )}
          </span>
                    </div>
                    <button
                        type="button"
                        onClick={verify}
                        disabled={verifyDisabled}
                        className={[
                            "w-full rounded-3xl py-3.5 text-[15px] font-medium transition",
                            "bg-gray-900 dark:bg-white text-white dark:text-gray-900",
                            "hover:opacity-90",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                        ].join(" ")}
                    >
                        {loading ? t("cta.verifying") : t("cta.verify")}
                    </button>
                    <button
                        type="button"
                        onClick={resend}
                        disabled={resendDisabled}
                        className={[
                            "w-full rounded-3xl py-3.5 text-[15px] font-medium transition",
                            "bg-transparent",
                            "text-[color:var(--text)]",
                            "hover:opacity-90",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                        ].join(" ")}
                    >
                        {resendDisabled ? t("cta.resendWithTimer", {time: fmt(cooldownLeft)}) : t("cta.resend")}
                    </button>

                    {status && (
                        <p className={["text-sm", status.type === "ok" ? "text-black dark:text-white" : "text-red-500/90"].join(" ")}>
                            {status.msg}
                        </p>
                    )}

                    {showOrdersCta && (
                        <button
                            type="button"
                            onClick={() => router.replace(withLocale("/account/orders"))}
                            className={[
                                "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                                "bg-black text-white hover:opacity-90",
                                "dark:bg-white dark:text-black",
                            ].join(" ")}
                        >
                            {t("cta.openOrders")}
                        </button>
                    )}
                </div>

                <p className="mt-10 text-sm text-[color:var(--muted)]">{t("footerHint")}</p>
            </div>
            {/* ✅ separate card UNDER the auth card */}
            {flow === "signup" && pendingOrderToken ? <BookingDetectedCard text={t("bookingDetected")}/> : null}
        </div>
    );
}

export default function VerifyCodePage() {
    return (
        <Suspense
            fallback={
                <div className="text-center">
                    <div className="animate-pulse text-[color:var(--muted)]">Loading…</div>
                </div>
            }
        >
            <VerifyCodeInner/>
        </Suspense>
    );
}
