"use client";

import { useEffect, useMemo, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { createClient } from "@/lib/supabase/client";
import { Check, X } from "lucide-react";
import { z } from "zod";

type Status = "idle" | "checking" | "available" | "unavailable" | "notify-form" | "notified";

type ProfileRow = {
    postal_code: string | null;
};

const CheckPostcodeResponseSchema = z.object({
    available: z.boolean(),
});

const NotifyResponseSchema = z.object({
    success: z.boolean(),
});

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setStep } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifyLoading, setNotifyLoading] = useState(false);

    const canCheck = postcode.length === 5;
    const emailOk = useMemo(() => notifyEmail.trim().includes("@"), [notifyEmail]);

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
                    const v = p.postal_code.trim().replace(/\D/g, "").slice(0, 5);
                    if (v.length === 5) setPostcode(v);
                }
            } catch {
                // silent
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [postcode, setPostcode]);

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    const handleCheck = async () => {
        if (!canCheck) return;

        setStatus("checking");

        // ✅ local list first (silent)
        if (SERVICE_AREAS.includes(postcode)) {
            setPostcodeVerified(true);
            setStatus("available");
            handleContinue(); // ✅ auto continue
            return;
        }

        try {
            const res = await fetch("/api/booking/check-postcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postcode }),
            });

            const raw = await res.json().catch(() => null);
            const parsed = CheckPostcodeResponseSchema.safeParse(raw);
            const available = res.ok && parsed.success ? parsed.data.available : false;

            if (available) {
                setPostcodeVerified(true);
                setStatus("available");
                handleContinue(); // ✅ auto continue
                return;
            }

            setStatus("unavailable");
        } catch {
            // no scary UI errors
            setStatus("unavailable");
        }
    };

    // ✅ auto-check when 5 digits entered (no "Check" button)
    useEffect(() => {
        if (!canCheck) return;

        // if user types again after unavailable/notify, reset UI a bit
        setStatus("checking");

        const t = window.setTimeout(() => {
            handleCheck();
        }, 220);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postcode]);

    const submitNotify = async () => {
        if (notifyLoading) return;
        if (!emailOk || !canCheck) return;

        setNotifyLoading(true);

        try {
            const res = await fetch("/api/booking/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: notifyEmail.trim(), postcode }),
            });

            const raw = await res.json().catch(() => null);
            const parsed = NotifyResponseSchema.safeParse(raw);
            const ok = res.ok && parsed.success && parsed.data.success;

            if (!ok) {
                // no raw server error in UI
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
            <p className="text-gray-500 mb-8">
                Enter your postal code to see if we currently serve your area.
            </p>

            {/* INPUT (no huge font, placeholder small) */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="PLZ"
                value={postcode}
                onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setPostcode(v);

                    // reset states when user edits
                    if (v.length < 5) {
                        setStatus("idle");
                    } else {
                        setStatus("checking");
                    }
                }}
                className={[
                    "w-full max-w-sm rounded-2xl border px-4 py-3.5 text-center outline-none transition",
                    "bg-white/70 backdrop-blur border-black/10 text-black",
                    "text-[15px] font-medium tracking-[0.18em]",
                    "placeholder:text-black/35 placeholder:tracking-normal",
                    "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                ].join(" ")}
            />

            {/* quiet status */}
            {status === "checking" && (
                <div className="mt-4 text-sm text-black/40">Checking…</div>
            )}

            {/* AVAILABLE (usually flashes briefly because we auto-continue) */}
            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-1">Available</div>
                    <div className="opacity-80">We serve PLZ {postcode}.</div>
                </div>
            )}

            {/* UNAVAILABLE */}
            {status === "unavailable" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-1">Not available</div>
                    <div className="opacity-80 mb-5">We don’t serve PLZ {postcode} yet.</div>

                    <button
                        type="button"
                        onClick={() => setStatus("notify-form")}
                        className="w-full py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
                    >
                        Notify me
                    </button>
                </div>
            )}

            {/* NOTIFY FORM */}
            {status === "notify-form" && (
                <div className="w-full max-w-md mt-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-5 animate-fadeIn text-left">
                    <div className="text-[15px] font-semibold text-black">Get notified</div>
                    <p className="mt-1 text-sm text-black/55">
                        We’ll email you when we expand to <span className="font-medium text-black/80">{postcode}</span>.
                    </p>

                    <div className="mt-4 space-y-3">
                        <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="Email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            className={[
                                "w-full rounded-2xl border px-4 py-3.5 outline-none transition",
                                "bg-white/70 backdrop-blur border-black/10 text-black text-[15px] font-medium",
                                "placeholder:text-black/35",
                                "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                            ].join(" ")}
                        />

                        <button
                            type="button"
                            onClick={submitNotify}
                            disabled={!emailOk || notifyLoading}
                            className={[
                                "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                                "bg-black text-white hover:opacity-90",
                                "disabled:opacity-40 disabled:cursor-not-allowed",
                            ].join(" ")}
                        >
                            {notifyLoading ? "Sending…" : "Notify me"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatus("unavailable")}
                            className="w-full rounded-2xl border border-black/10 bg-white/60 py-3.5 text-[15px] font-medium text-black/70 backdrop-blur hover:text-black transition"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}

            {/* NOTIFIED SUCCESS */}
            {status === "notified" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="text-lg font-semibold mb-1">You’ll be notified</div>
                    <div className="opacity-80">
                        Thanks — we’ll email you when service becomes available in {postcode}.
                    </div>
                </div>
            )}
        </div>
    );
}