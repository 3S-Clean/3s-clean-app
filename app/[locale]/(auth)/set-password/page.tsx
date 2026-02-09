"use client";

import {useEffect, useMemo, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {createClient} from "@/shared/lib/supabase/client";
import {CARD_FRAME_BASE} from "@/shared/ui/card/CardFrame";

export default function SetPasswordPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations("auth.setPassword");
    const supabase = useMemo(() => createClient(), []);

    // locale-aware hrefs for /en/* and /de/*
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const nextRaw = sp.get("next") || "";
    // next already comes encoded from verify-code; keep as-is, just decode safely
    const nextUrl = (() => {
        if (!nextRaw) return "";
        try {
            return decodeURIComponent(nextRaw);
        } catch {
            return nextRaw;
        }
    })();

    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<null | { type: "error" | "ok"; msg: string }>(null);
    const [loading, setLoading] = useState(false);

    const validatePassword = (value: string): string | null => {
        if (value.length < 8) return t("errors.minLen");
        if (!/[A-Z]/.test(value)) return t("errors.uppercase");
        if (!/[0-9]/.test(value)) return t("errors.number");
        return null;
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const {data, error} = await supabase.auth.getSession();
            if (cancelled) return;

            const ok = !!data.session && !error;
            setHasSession(ok);

            if (!ok) {
                router.replace(withLocale("/signup"));
                router.refresh();
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase, router, withLocale]);

    const submit = async () => {
        setStatus(null);

        const passwordError = validatePassword(password);
        if (passwordError) {
            setStatus({type: "error", msg: passwordError});
            return;
        }

        if (password !== confirm) {
            setStatus({type: "error", msg: t("errors.mismatch")});
            return;
        }

        setLoading(true);
        try {
            const {error} = await supabase.auth.updateUser({password});

            if (error) {
                setStatus({type: "error", msg: error.message});
                return;
            }

            try {
                localStorage.removeItem("pendingEmail");
            } catch {
            }

            setStatus({type: "ok", msg: t("status.ok")});

            // ✅ go to next if provided, otherwise account
            if (nextUrl) {
                router.replace(nextUrl);
                router.refresh();
                return;
            }

            router.replace(withLocale("/account"));
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    if (hasSession === null) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-[color:var(--text)]">{t("loading.title")}</h1>
                <p className="mt-4 text-sm text-[color:var(--muted)]">{t("loading.subtitle")}</p>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">{t("title")}</h1>

            <p className="mt-6 text-base text-[color:var(--muted)]">{t("subtitle")}</p>

            <div className="mt-10 space-y-4">
                <input
                    type="password"
                    placeholder={t("placeholders.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={[
                        "w-full",
                        CARD_FRAME_BASE,
                        "rounded-2xl px-4 py-3.5 text-[15px]",
                        "bg-transparent",
                        "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                        "outline-none transition-all duration-200",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                        "active:scale-[0.99]",
                    ].join(" ")}
                />
                <input
                    type="password"
                    placeholder={t("placeholders.confirm")}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={[
                        "w-full",
                        CARD_FRAME_BASE,
                        "rounded-2xl px-4 py-3.5 text-[15px]",
                        "bg-transparent",
                        "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                        "outline-none transition-all duration-200",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                        "active:scale-[0.99]",
                    ].join(" ")}
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className={[
                        "w-full rounded-3xl py-3.5 text-[15px] font-medium transition",
                        "bg-gray-900 dark:bg-white text-white dark:text-gray-900",
                        "hover:opacity-90",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {loading ? t("cta.loading") : t("cta.default")}
                </button>

                {status && (
                    <p className={["text-sm", status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90"].join(" ")}>
                        {status.msg}
                    </p>
                )}
            </div>

            <p className="mt-10 text-sm text-[color:var(--muted)]">
                {t("support.prefix")}{" "}
                <a className="text-[color:var(--text)] hover:underline" href="mailto:support@3s-clean.com">
                    support@3s-clean.com
                </a>
                .
            </p>
        </div>
    );
}