// components/booking/PostcodeCheck.tsx
"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { MapPin, Check, X } from "lucide-react";

type Status = "idle" | "checking" | "available" | "unavailable" | "notify-form" | "notified";

type CheckPostcodeResponse = { available: boolean };
type NotifyResponse = { success: boolean; error?: string };

function getErrorMessage(e: unknown): string {
    if (e instanceof Error && typeof e.message === "string" && e.message.trim()) return e.message;
    if (typeof e === "string" && e.trim()) return e;
    return "Something went wrong.";
}

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setStep } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (postcode.length !== 5) return;

        setStatus("checking");
        setError(null);

        try {
            // ✅ быстрый локальный whitelist
            if (SERVICE_AREAS.includes(postcode)) {
                setStatus("available");
                return;
            }

            const res = await fetch("/api/booking/check-postcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postcode }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "API error");
            }

            const result = (await res.json()) as Partial<CheckPostcodeResponse>;
            setStatus(result.available ? "available" : "unavailable");
        } catch (e: unknown) {
            setError(getErrorMessage(e) || "Failed to check postcode.");
            setStatus("idle");
        }
    };

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    const handleNotifySubmit = async () => {
        if (!notifyEmail || !notifyEmail.includes("@")) return;

        setError(null);

        try {
            const res = await fetch("/api/booking/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: notifyEmail, postcode }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "API error");
            }

            const result = (await res.json()) as Partial<NotifyResponse>;
            if (!result.success) {
                setError((typeof result.error === "string" && result.error) || "Failed to submit notify request.");
                return;
            }

            setStatus("notified");
        } catch (e: unknown) {
            setError(getErrorMessage(e) || "Failed to submit notify request.");
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setPostcode("");
        setNotifyEmail("");
        setError(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-8">
                <MapPin className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8">Enter your postal code to see if we serve your area</p>

            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter PLZ"
                value={postcode}
                onChange={(e) => {
                    setPostcode(e.target.value.replace(/\D/g, ""));
                    setStatus("idle");
                    setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="w-full max-w-sm px-6 py-4 text-center text-2xl font-medium tracking-widest border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
            />

            {error && <div className="mb-4 text-sm text-black/60">{error}</div>}

            {(status === "idle" || status === "checking") && (
                <button
                    onClick={handleCheck}
                    disabled={postcode.length !== 5 || status === "checking"}
                    className="w-full max-w-sm py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 transition-all"
                >
                    {status === "checking" ? "Checking..." : "Check"}
                </button>
            )}

            {/* AVAILABLE */}
            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Great news!</div>
                    <div className="opacity-80 mb-5">We serve PLZ {postcode}. Let&#39;s book your cleaning!</div>
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all"
                    >
                        Continue to Booking →
                    </button>
                </div>
            )}

            {/* UNAVAILABLE */}
            {status === "unavailable" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Not available yet</div>
                    <div className="opacity-80 mb-5">We don&#39;t serve PLZ {postcode} yet, but we&#39;re expanding!</div>
                    <button
                        onClick={() => {
                            setError(null);
                            setStatus("notify-form");
                        }}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all"
                    >
                        Notify me when available
                    </button>
                </div>
            )}

            {/* NOTIFY FORM */}
            {status === "notify-form" && (
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl animate-fadeIn text-center">
                    <div className="text-3xl mb-3">📬</div>
                    <div className="text-lg font-semibold mb-2">Get notified</div>
                    <div className="text-gray-500 mb-5 text-sm">We&#39;ll email you when we expand to PLZ {postcode}</div>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="w-full px-4 py-3 mb-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />

                    <button
                        onClick={handleNotifySubmit}
                        disabled={!notifyEmail.includes("@")}
                        className="w-full py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 transition-all"
                    >
                        Notify Me
                    </button>

                    <button onClick={handleReset} className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700">
                        ← Try another postcode
                    </button>
                </div>
            )}

            {/* NOTIFIED */}
            {status === "notified" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">You&#39;re on the list!</div>
                    <div className="opacity-80 mb-5">We&#39;ll notify {notifyEmail} when we expand to PLZ {postcode}</div>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 border border-white text-white font-medium rounded-full hover:bg-white hover:text-gray-900 transition-all"
                    >
                        Check another postcode
                    </button>
                </div>
            )}

            <div className="mt-12 p-5 bg-gray-50 rounded-2xl max-w-md w-full">
                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Currently serving</div>
                <div className="text-sm text-gray-500">
                    Stuttgart City Center (70173-70199), Vaihingen, Möhringen, Degerloch, Feuerbach
                </div>
            </div>
        </div>
    );
}