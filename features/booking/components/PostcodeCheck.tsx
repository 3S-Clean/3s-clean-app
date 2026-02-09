"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {useBookingStore} from "@/features/booking/lib/store";
import {createClient} from "@/shared/lib/supabase/client";
import {isServiceAreaPostcode} from "@/features/booking/lib/guards";
import {Check, X} from "lucide-react";
import {z} from "zod";
import {AUTH_CARD_BASE, CARD_FRAME_BASE} from "@/shared/ui";

type Status = "idle" | "checking" | "available" | "unavailable" | "notified";
type ProfileRow = { postal_code: string | null };

const CheckPostcodeResponse = z.object({available: z.boolean()});
const NotifyResponse = z.object({success: z.boolean()});

function clean5(v: string) {
    return v.replace(/\D/g, "").slice(0, 5);
}

function isValidEmail(v: string) {
    const s = v.trim();
    return s.includes("@") && s.includes(".") && s.length >= 6;
}

export default function PostcodeCheck() {
    const t = useTranslations("postcode.postcodeCheck");

    const {
        postcode,
        setPostcode,
        setPostcodeVerified,
        setFormData,
        plzAutofillDisabled,
        setPlzAutofillDisabled,
    } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifyLoading, setNotifyLoading] = useState(false);

    const canNotify = useMemo(
        () => isValidEmail(notifyEmail) && postcode.length === 5,
        [notifyEmail, postcode]
    );

    // ✅ autofill postcode from profile (only if empty AND not disabled)
    useEffect(() => {
        if (postcode.trim()) return;
        if (plzAutofillDisabled) return;

        const supabase = createClient();
        let cancelled = false;

        (async () => {
            try {
                const {data: u} = await supabase.auth.getUser();
                const user = u?.user;
                if (!user) return;

                const {data} = await supabase
                    .from("profiles")
                    .select("postal_code")
                    .eq("id", user.id)
                    .maybeSingle();

                if (cancelled) return;

                const p = data as ProfileRow | null;
                const v = (p?.postal_code || "").trim();
                if (v) {
                    setPostcode(v);
                    setFormData({postalCode: v}); // sync in formData
                }
            } catch {
                // silent
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [postcode, plzAutofillDisabled, setPostcode, setFormData]);

    // ✅ auto-check when 5 digits
    useEffect(() => {
        if (postcode.length !== 5) {
            setStatus("idle");
            setPostcodeVerified(false);
            return;
        }

        let cancelled = false;
        setStatus("checking");

        const tt = window.setTimeout(async () => {
            if (cancelled) return;

            if (isServiceAreaPostcode(postcode)) {
                setStatus("available");
                setPostcodeVerified(true);
                return;
            }

            try {
                const res = await fetch("/api/booking/check-postcode", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({postcode}),
                });

                const raw = await res.json().catch(() => null);
                const parsed = CheckPostcodeResponse.safeParse(raw);
                const available = parsed.success ? parsed.data.available : false;

                if (cancelled) return;

                if (res.ok && available) {
                    setStatus("available");
                    setPostcodeVerified(true);
                } else {
                    setStatus("unavailable");
                    setPostcodeVerified(false);
                }
            } catch {
                if (!cancelled) {
                    setStatus("unavailable");
                    setPostcodeVerified(false);
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(tt);
        };
    }, [postcode, setPostcodeVerified]);

    const submitNotify = async () => {
        if (!canNotify || notifyLoading) return;

        setNotifyLoading(true);
        try {
            const res = await fetch("/api/booking/notify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: notifyEmail.trim(), postcode}),
            });

            const raw = await res.json().catch(() => null);
            const parsed = NotifyResponse.safeParse(raw);

            if (!res.ok || !parsed.success || !parsed.data.success) {
                console.error("notify failed", {status: res.status, raw});
                return;
            }

            setStatus("notified");
        } finally {
            setNotifyLoading(false);
        }
    };

    // -------- UI (new design tokens) --------
    const inputCls = [
        "w-full",
        AUTH_CARD_BASE,
        "rounded-2xl px-4 py-3.5 text-[16px]",
        "bg-transparent",
        "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
        "outline-none transition-all duration-200",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
        "active:scale-[0.99]",
    ].join(" ");

    const cardCls = [CARD_FRAME_BASE, "w-full max-w-md mt-6 p-6 text-left"].join(" ");

    const buttonCls = [
        "mt-4 w-full rounded-3xl py-3.5 text-[15px] font-medium transition",
        "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
        "hover:opacity-90",
        "disabled:opacity-40 disabled:cursor-not-allowed",
    ].join(" ");

    const iconBubble = "h-10 w-10 rounded-xl flex items-center justify-center bg-[var(--text)]/5 dark:bg-white/10";
    const titleCls = "text-lg font-semibold text-[color:var(--text)]";
    const bodyCls = "mt-1 text-sm text-[color:var(--muted)]";

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
            <p className="text-[var(--muted)] mb-8 max-w-md">{t("subtitle")}</p>

            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder={t("postcodePlaceholder")}
                value={postcode}
                onChange={(e) => {
                    const v = clean5(e.target.value);

                    setPlzAutofillDisabled(true);

                    setPostcode(v);
                    setFormData({postalCode: v});

                    if (v.length < 5) {
                        setStatus("idle");
                        setNotifyEmail("");
                        setPostcodeVerified(false);
                    }
                }}
                className={inputCls}
            />

            {status === "checking" && (
                <div className="mt-4 text-sm text-[var(--muted)]">{t("checking")}</div>
            )}

            {status === "available" && (
                <div className={cardCls}>
                    <div className="flex items-start gap-3">
                        <div className={iconBubble}>
                            <Check className="h-5 w-5 text-[color:var(--text)]"/>
                        </div>
                        <div>
                            <div className={titleCls}>{t("availableTitle")}</div>
                            <div className={bodyCls}>{t("availableBody", {postcode})}</div>
                        </div>
                    </div>
                </div>
            )}

            {status === "unavailable" && (
                <div className={cardCls}>
                    <div className="flex items-start gap-3">
                        <div className={iconBubble}>
                            <X className="h-5 w-5 text-[color:var(--text)]"/>
                        </div>
                        <div className="w-full">
                            <div className={titleCls}>{t("unavailableTitle")}</div>
                            <div className={[bodyCls, "mb-4"].join(" ")}>{t("unavailableBody", {postcode})}</div>

                            <input
                                type="email"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                placeholder={t("emailPlaceholder")}
                                className={inputCls}
                            />

                            <button
                                type="button"
                                onClick={submitNotify}
                                disabled={!canNotify || notifyLoading}
                                className={buttonCls}
                            >
                                {notifyLoading ? t("notifyLoading") : t("notifyCta")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === "notified" && (
                <div className={cardCls}>
                    <div className="flex items-start gap-3">
                        <div className={iconBubble}>
                            <Check className="h-5 w-5 text-[color:var(--text)]"/>
                        </div>
                        <div>
                            <div className={titleCls}>{t("notifiedTitle")}</div>
                            <div className={bodyCls}>{t("notifiedBody", {postcode})}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}