"use client";

import { useEffect, useRef, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { Check, X } from "lucide-react";

type Status = "idle" | "checking" | "available" | "unavailable";

export default function PostcodeCheck() {
    const {
        postcode,
        setPostcode,
        setPostcodeVerified,
        setStep,
        resetBooking,
    } = useBookingStore();

    const [status, setStatus] = useState<Status>("idle");
    const reqIdRef = useRef(0);

    // ─────────────────────────────────────────────
    // ТИХАЯ автопроверка (без ошибок, без кнопки)
    // ─────────────────────────────────────────────
    useEffect(() => {
        const plz = postcode.trim();

        if (plz.length !== 5) {
            queueMicrotask(() => setStatus("idle"));
            return;
        }

        const myReqId = ++reqIdRef.current;

        const run = async () => {
            setStatus("checking");

            // локальный whitelist
            if (SERVICE_AREAS.includes(plz)) {
                if (reqIdRef.current === myReqId) setStatus("available");
                return;
            }

            try {
                const res = await fetch("/api/booking/check-postcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postcode: plz }),
                });

                const json = await res.json().catch(() => ({}));
                if (reqIdRef.current !== myReqId) return;

                setStatus(json?.available ? "available" : "unavailable");
            } catch {
                if (reqIdRef.current === myReqId) setStatus("unavailable");
            }
        };

        const t = setTimeout(run, 250);
        return () => clearTimeout(t);
    }, [postcode]);

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    const handleReset = () => {
        resetBooking();
        setStatus("idle");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            {/* TITLE */}
            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8 text-base">
                Enter your postal code to see if we currently serve your area.
            </p>

            {/* INPUT */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="PLZ"
                value={postcode}
                onChange={(e) =>
                    setPostcode(e.target.value.replace(/\D/g, ""))
                }
                className="
          w-full max-w-sm px-6 py-4
          text-center text-xl font-medium tracking-widest
          placeholder:text-base placeholder:tracking-normal
          border border-gray-200 rounded-2xl
          focus:outline-none focus:ring-2 focus:ring-gray-900
        "
            />

            {/* STATUS */}
            {status === "checking" && (
                <div className="mt-4 text-sm text-gray-400">
                    Checking availability…
                </div>
            )}

            {/* AVAILABLE */}
            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center mt-6 animate-fadeIn">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Available</div>
                    <div className="opacity-80 mb-5">
                        We serve PLZ {postcode}. Let’s continue.
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
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center mt-6 animate-fadeIn">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-2">Not available</div>
                    <div className="opacity-80">
                        We don’t serve this area yet.
                    </div>
                </div>
            )}

            {/* INFO + RESET */}
            <div className="mt-12 max-w-md text-center">
                <p className="text-sm text-gray-500 leading-relaxed">
                    For your convenience, we temporarily store your entered data for{" "}
                    <span className="font-medium text-gray-700">15 minutes</span>.
                    <br />
                    This allows you to continue smoothly after a refresh.
                    <br />
                    To check another address or remove the data immediately, use Reset.
                </p>

                <button
                    onClick={handleReset}
                    className="
            mt-6 inline-flex items-center justify-center
            rounded-full px-7 py-3
            text-sm font-medium
            text-gray-700
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