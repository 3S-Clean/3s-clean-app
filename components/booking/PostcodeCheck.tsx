"use client";

import { useEffect, useMemo, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Mail } from "lucide-react";
import { z } from "zod";

type Status = "idle" | "checking" | "available" | "unavailable" | "notified";
type ProfileRow = { postal_code: string | null; email?: string | null };

const CheckPostcodeResponse = z.object({ available: z.boolean() });
const NotifyResponse = z.object({ success: z.boolean() });

function clean5(v: string) {
    return v.replace(/\D/g, "").slice(0, 5);
}

function isValidEmail(v: string) {
    const s = v.trim();
    return s.includes("@") && s.includes(".") && s.length >= 6;
}

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setFormData } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");

    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifyLoading, setNotifyLoading] = useState(false);

    const canNotify = useMemo(
        () => isValidEmail(notifyEmail) && postcode.length === 5,
        [notifyEmail, postcode]
    );

    // ✅ autofill postcode from profile (only if empty)
    useEffect(() => {
        if (postcode.trim()) return;

        const supabase = createClient();
        let cancelled = false;

        (async () => {
            try {
                const { data: u } = await supabase.auth.getUser();
                const user = u?.user;
                if (!user) return;

                const { data } = await supabase
                    .from("profiles")
                    .select("postal_code")
                    .eq("id", user.id)
                    .maybeSingle();

                if (cancelled) return;

                const p = data as ProfileRow | null;
                if (p?.postal_code?.trim()) {
                    const v = p.postal_code.trim();
                    setPostcode(v);
                    setFormData({ postalCode: v }); // sync in formData
                }
            } catch {
                // silent
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [postcode, setPostcode, setFormData]);

    // ✅ auto-check when 5 digits
    useEffect(() => {
        if (postcode.length !== 5) {
            setStatus("idle");
            setPostcodeVerified(false);
            return;
        }

        let cancelled = false;
        setStatus("checking");

        const t = window.setTimeout(async () => {
            if (cancelled) return;

            // local allow-list fast path
            if (SERVICE_AREAS.includes(postcode)) {
                setStatus("available");
                setPostcodeVerified(true);
                return;
            }

            try {
                const res = await fetch("/api/booking/check-postcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postcode }),
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
            window.clearTimeout(t);
        };
    }, [postcode, setPostcodeVerified]);

    const submitNotify = async () => {
        if (!canNotify || notifyLoading) return;

        setNotifyLoading(true);
        try {
            const res = await fetch("/api/booking/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: notifyEmail.trim(), postcode }),
            });

            const raw = await res.json().catch(() => null);
            const parsed = NotifyResponse.safeParse(raw);

            if (!res.ok || !parsed.success || !parsed.data.success) {
                console.error("notify failed", { status: res.status, raw });
                return;
            }

            setStatus("notified");
        } finally {
            setNotifyLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8">Enter your postal code to see if we currently serve your area.</p>

            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Your postal code"
                value={postcode}
                onChange={(e) => {
                    const v = clean5(e.target.value);
                    setPostcode(v);
                    setFormData({ postalCode: v }); // sync in formData

                    // reset UI when editing
                    if (v.length < 5) {
                        setStatus("idle");
                        setNotifyEmail("");
                        setPostcodeVerified(false);
                    }
                }}
                className={[
                    "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                    "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                    "placeholder:text-[color:var(--muted)]/70",
                    "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                ].join(" ")}
            />

            {status === "checking" && <div className="mt-4 text-sm text-gray-400">Checking…</div>}

            {status === "available" && (
                <div className="w-full max-w-md mt-6 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-5 animate-fadeIn">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-black/70" />
                    </div>
                    <div className="text-lg font-semibold mb-1 text-black">Available</div>
                    <div className="text-black/60">Great — we serve PLZ {postcode}. You can continue.</div>
                </div>
            )}

            {status === "unavailable" && (
                <div className="w-full max-w-md mt-6 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-5 animate-fadeIn">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-black/70" />
                    </div>
                    <div className="text-lg font-semibold mb-1 text-black">Not available</div>
                    <div className="text-black/60 mb-4">We don’t serve PLZ {postcode} yet.</div>

                    <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur px-4 py-3 flex items-center gap-3">
                        <Mail className="w-5 h-5 text-black/40" />
                        <input
                            type="email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={[
                                "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                                "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                                "placeholder:text-[color:var(--muted)]/70",
                                "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                            ].join(" ")}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={submitNotify}
                        disabled={!canNotify || notifyLoading}
                        className={[
                            "mt-4 w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                            "disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90",
                            "bg-black text-white",
                        ].join(" ")}
                    >
                        {notifyLoading ? "Sending…" : "Notify me"}
                    </button>
                </div>
            )}

            {status === "notified" && (
                <div className="w-full max-w-md mt-6 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-5 animate-fadeIn">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-black/70" />
                    </div>
                    <div className="text-lg font-semibold mb-1 text-black">You’ll be notified</div>
                    <div className="text-black/60">We’ll email you when we expand to PLZ {postcode}.</div>
                </div>
            )}
        </div>
    );
}