"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { MapPin, Check, X } from "lucide-react";

type Status = "idle" | "checking" | "available" | "unavailable" | "notify-form" | "notified";

export default function PostcodeCheck() {
    const {
        postcode,
        setPostcode,
        setPostcodeVerified,
        setStep,
        resetBooking,
    } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const [notifyEmail, setNotifyEmail] = useState("");

    const handleCheck = async () => {
        if (postcode.length !== 5) return;

        setStatus("checking");

        // ✅ тихая локальная проверка (без ошибок UI)
        if (SERVICE_AREAS.includes(postcode)) {
            setStatus("available");
            return;
        }

        try {
            const res = await fetch("/api/booking/check-postcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postcode }),
            });

            const json = await res.json();
            setStatus(json?.available ? "available" : "unavailable");
        } catch {
            // ❗️никаких ошибок пользователю
            setStatus("unavailable");
        }
    };

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    const handleReset = () => {
        resetBooking();
        setNotifyEmail("");
        setStatus("idle");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            {/* ICON */}
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-8">
                <MapPin className="w-10 h-10 text-white" />
            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8">
                Enter your postal code to see if we currently serve your area.
            </p>

            {/* INPUT */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter PLZ"
                value={postcode}
                onChange={(e) => {
                    setPostcode(e.target.value.replace(/\D/g, ""));
                    setStatus("idle");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="
                    w-full max-w-sm px-6 py-4
                    text-center text-2xl font-medium tracking-widest
                    border border-gray-200 rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-gray-900
                    mb-4
                "
            />

            {/* CHECK BUTTON */}
            {(status === "idle" || status === "checking") && (
                <button
                    onClick={handleCheck}
                    disabled={postcode.length !== 5 || status === "checking"}
                    className="
                        w-full max-w-sm py-4
                        bg-gray-900 text-white font-medium
                        rounded-full
                        disabled:bg-gray-300
                        transition-all
                    "
                >
                    {status === "checking" ? "Checking…" : "Check"}
                </button>
            )}

            {/* AVAILABLE */}
            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Great news</div>
                    <div className="opacity-80 mb-5">
                        We serve PLZ {postcode}. Let’s book your cleaning.
                    </div>
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
                    >
                        Continue →
                    </button>
                </div>
            )}

            {/* UNAVAILABLE */}
            {status === "unavailable" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Not available yet</div>
                    <div className="opacity-80 mb-5">
                        We don’t serve PLZ {postcode} at the moment.
                    </div>
                    <button
                        onClick={() => setStatus("notify-form")}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
                    >
                        Notify me
                    </button>
                </div>
            )}

            {/* NOTIFY FORM */}
            {status === "notify-form" && (
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl animate-fadeIn mt-6">
                    <div className="text-lg font-semibold mb-2">Get notified</div>
                    <p className="text-sm text-gray-500 mb-4">
                        We’ll let you know when we expand to PLZ {postcode}.
                    </p>

                    <input
                        type="email"
                        placeholder="Email address"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="
                            w-full px-4 py-3 mb-3
                            border border-gray-200 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-gray-900
                        "
                    />

                    <button
                        disabled={!notifyEmail.includes("@")}
                        onClick={() => setStatus("notified")}
                        className="
                            w-full py-3 bg-gray-900 text-white
                            rounded-full font-medium
                            disabled:bg-gray-300
                        "
                    >
                        Notify me
                    </button>
                </div>
            )}

            {/* NOTIFIED */}
            {status === "notified" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="text-lg font-semibold mb-2">You’re on the list</div>
                    <div className="opacity-80">
                        We’ll notify you when service becomes available.
                    </div>
                </div>
            )}

            {/* INFO + RESET */}
            <div className="mt-10 max-w-md text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                    For your convenience, we temporarily store your entered details for{" "}
                    <span className="font-medium text-gray-700">15 minutes</span>.
                    <br />
                    This allows you to continue seamlessly after a refresh.
                    <br />
                    To check another address or remove the data immediately, use Reset.
                </p>

                <button
                    onClick={handleReset}
                    className="
                        mt-4 inline-flex items-center justify-center
                        rounded-full px-5 py-2
                        text-xs font-medium
                        text-gray-600
                        border border-gray-200
                        hover:text-gray-900 hover:border-gray-300
                        transition
                    "
                >
                    Reset
                </button>
            </div>
        </div>
    );
}