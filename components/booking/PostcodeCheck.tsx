"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { Check, X } from "lucide-react";

type Status = "idle" | "checking" | "available" | "unavailable";

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setStep } =
        useBookingStore();

    const [status, setStatus] = useState<Status>("idle");

    const handleCheck = async () => {
        if (postcode.length !== 5) return;

        setStatus("checking");

        // тихая локальная проверка
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
            // никаких ошибок пользователю
            setStatus("unavailable");
        }
    };

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
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
                placeholder="PLZ"
                value={postcode}
                onChange={(e) => {
                    setPostcode(e.target.value.replace(/\D/g, ""));
                    setStatus("idle");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="
          w-full max-w-sm px-6 py-4
          text-center text-lg font-medium tracking-widest
          border border-gray-200 rounded-2xl
          focus:outline-none focus:ring-2 focus:ring-gray-900
          mb-6
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
                    <div className="text-lg font-semibold mb-2">Available</div>
                    <div className="opacity-80 mb-5">
                        We serve PLZ {postcode}.
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
                    <div className="text-lg font-semibold mb-2">Not available</div>
                    <div className="opacity-80">
                        We don’t serve PLZ {postcode} yet.
                    </div>
                </div>
            )}
        </div>
    );
}