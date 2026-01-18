"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { checkPostcode, submitNotifyRequest } from "@/lib/booking/actions";
import { ALLOWED_POSTAL_CODES } from "@/lib/booking/config";

type Status = "idle" | "checking" | "available" | "unavailable";

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setStep } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const [showNotifyForm, setShowNotifyForm] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifySubmitted, setNotifySubmitted] = useState(false);

    const handleCheck = async () => {
        if (postcode.length !== 5) return;

        setStatus("checking");

        // локальный быстрый чек
        const isLocal = ALLOWED_POSTAL_CODES.has(postcode);
        if (isLocal) {
            setStatus("available");
            return;
        }

        // серверный чек
        const result = await checkPostcode(postcode);
        setStatus(result.available ? "available" : "unavailable");
    };

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    const handleNotifySubmit = async () => {
        if (!notifyEmail || !notifyEmail.includes("@")) return;
        await submitNotifyRequest(notifyEmail, postcode);
        setNotifySubmitted(true);
    };

    const handleReset = () => {
        setStatus("idle");
        setPostcode("");
        setShowNotifyForm(false);
        setNotifySubmitted(false);
        setNotifyEmail("");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>

            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8">Enter your postal code to see if we serve your area</p>

            <div className="w-full max-w-sm mb-4">
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
                    className="w-full px-6 py-4 text-center text-2xl font-medium tracking-widest border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            {status === "idle" && (
                <button
                    onClick={handleCheck}
                    disabled={postcode.length !== 5}
                    className="w-full max-w-sm py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                >
                    Check
                </button>
            )}

            {/* AVAILABLE - BLACK CARD */}
            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="text-3xl mb-3">✓</div>
                    <div className="text-lg font-semibold mb-2">Great news!</div>
                    <div className="opacity-80 mb-5">
                        We serve PLZ {postcode}. Let&apos;s book your cleaning!
                    </div>
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all"
                    >
                        Continue to Booking →
                    </button>
                </div>
            )}

            {/* UNAVAILABLE - BLACK CARD */}
            {status === "unavailable" && !showNotifyForm && !notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="text-3xl mb-3">✗</div>
                    <div className="text-lg font-semibold mb-2">Not available yet</div>
                    <div className="opacity-80 mb-5">
                        We don&apos;t serve PLZ {postcode} yet, but we&apos;re expanding!
                    </div>
                    <button
                        onClick={() => setShowNotifyForm(true)}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all"
                    >
                        Notify me when available
                    </button>
                </div>
            )}

            {/* NOTIFY FORM */}
            {showNotifyForm && !notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl animate-fadeIn text-center">
                    <div className="text-3xl mb-3">📬</div>
                    <div className="text-lg font-semibold mb-2">Get notified</div>
                    <div className="text-gray-500 mb-5 text-sm">
                        We&apos;ll email you as soon as we start serving PLZ {postcode}
                    </div>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="w-full px-4 py-3 mb-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />

                    <button
                        onClick={handleNotifySubmit}
                        disabled={!notifyEmail || !notifyEmail.includes("@")}
                        className="w-full py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 hover:bg-gray-800 transition-all"
                    >
                        Notify Me
                    </button>

                    <button onClick={handleReset} className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700">
                        ← Try another postcode
                    </button>
                </div>
            )}

            {/* SUBMITTED - BLACK CARD */}
            {notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn">
                    <div className="text-3xl mb-3">✓</div>
                    <div className="text-lg font-semibold mb-2">You&apos;re on the list!</div>
                    <div className="opacity-80 mb-5">
                        We&apos;ll notify {notifyEmail} when we expand to PLZ {postcode}
                    </div>
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
                    Stuttgart City Center (70173-70199), Vaihingen, Möhringen, Degerloch, Feuerbach, Weilimdorf
                </div>
            </div>
        </div>
    );
}