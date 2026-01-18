"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { checkPostalCode, createNotifyRequest } from "@/lib/booking/actions";
import { ALLOWED_POSTAL_CODES } from "@/lib/booking/config";

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, nextStep, setFormData } = useBookingStore();

    const [status, setStatus] = useState<"idle" | "available" | "unavailable">("idle");
    const [showNotifyForm, setShowNotifyForm] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifySubmitted, setNotifySubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const normalizePostcode = (value: string) => value.replace(/\D/g, "").slice(0, 5);

    const handlePostcodeInput = (value: string) => {
        const normalized = normalizePostcode(value);
        setPostcode(normalized);
        setStatus("idle");
        setShowNotifyForm(false);
    };

    const handleCheck = async () => {
        if (postcode.length < 5) return;

        setIsLoading(true);

        // быстрый локальный чек (твой Set)
        if (ALLOWED_POSTAL_CODES.has(postcode)) {
            setStatus("available");
            setIsLoading(false);
            return;
        }

        try {
            const result = await checkPostalCode(postcode);
            setStatus(result.available ? "available" : "unavailable");
        } catch {
            setStatus("unavailable");
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        setPostcodeVerified(true);
        setFormData({ postalCode: postcode });
        nextStep();
    };

    const handleNotifySubmit = async () => {
        if (!notifyEmail || !notifyEmail.includes("@")) return;

        try {
            await createNotifyRequest(notifyEmail, postcode);
            setNotifySubmitted(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setShowNotifyForm(false);
        setNotifySubmitted(false);
        setPostcode("");
        setNotifyEmail("");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-8">
                <span className="text-4xl">📍</span>
            </div>

            <h1 className="text-3xl font-semibold mb-4">Check Availability</h1>
            <p className="text-gray-500 text-lg mb-10 max-w-md">
                Enter your postal code to see if we serve your area
            </p>

            <div className="flex flex-col gap-3 w-full max-w-md mb-6">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter PLZ (e.g., 70173)"
                    value={postcode}
                    onChange={(e) => handlePostcodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    className="w-full px-5 py-4 text-lg text-center tracking-widest font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <button
                    onClick={handleCheck}
                    disabled={postcode.length < 5 || isLoading}
                    className="w-full py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                >
                    {isLoading ? "Checking..." : "Check"}
                </button>
            </div>

            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-green-50 border border-green-400 rounded-2xl animate-fadeIn">
                    <div className="text-3xl mb-3">✅</div>
                    <div className="text-lg font-semibold text-green-700 mb-2">Great news!</div>
                    <div className="text-green-600 mb-5">
                        We serve PLZ {postcode}. Let&apos;s book your cleaning!
                    </div>
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all"
                    >
                        Continue to Booking →
                    </button>
                </div>
            )}

            {status === "unavailable" && !showNotifyForm && !notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-orange-50 border border-orange-400 rounded-2xl animate-fadeIn">
                    <div className="text-3xl mb-3">😔</div>
                    <div className="text-lg font-semibold text-orange-700 mb-2">Not available yet</div>
                    <div className="text-orange-600 mb-5">
                        We don&apos;t serve PLZ {postcode} yet, but we&apos;re expanding!
                    </div>
                    <button
                        onClick={() => setShowNotifyForm(true)}
                        className="w-full py-4 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-all"
                    >
                        Notify me when available
                    </button>
                </div>
            )}

            {showNotifyForm && !notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl animate-fadeIn">
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
                        className="w-full px-4 py-3 mb-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                    <button
                        onClick={handleNotifySubmit}
                        disabled={!notifyEmail || !notifyEmail.includes("@")}
                        className="w-full py-4 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
                    >
                        Notify Me
                    </button>
                    <button onClick={handleReset} className="mt-3 text-gray-500 text-sm hover:text-gray-700">
                        ← Try another postcode
                    </button>
                </div>
            )}

            {notifySubmitted && (
                <div className="w-full max-w-md p-6 bg-blue-50 border border-blue-400 rounded-2xl animate-fadeIn">
                    <div className="text-3xl mb-3">🎉</div>
                    <div className="text-lg font-semibold text-blue-700 mb-2">You&apos;re on the list!</div>
                    <div className="text-blue-600 mb-5">
                        We&apos;ll notify {notifyEmail} when we expand to PLZ {postcode}
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 border border-blue-400 text-blue-600 font-medium rounded-full hover:bg-blue-100 transition-all"
                    >
                        Check another postcode
                    </button>
                </div>
            )}

            <div className="mt-12 p-5 bg-gray-100 rounded-xl max-w-md w-full">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Currently serving
                </div>
                <div className="text-sm text-gray-600">
                    Stuttgart City Center (70173-70199), Vaihingen, Möhringen, Degerloch, Feuerbach, Weilimdorf
                </div>
            </div>
        </div>
    );
}