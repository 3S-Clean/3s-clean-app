"use client";

import { useEffect, useRef, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { SERVICE_AREAS } from "@/lib/booking/config";
import { Check, X } from "lucide-react";

type Status = "idle" | "checking" | "available" | "unavailable";

export default function PostcodeCheck() {
    const { postcode, setPostcode, setPostcodeVerified, setStep } = useBookingStore();
    const [status, setStatus] = useState<Status>("idle");

    const reqIdRef = useRef(0);

    useEffect(() => {
        const plz = postcode.trim();
        if (plz.length !== 5) return; // статус "idle" ставим в onChange — без setState в effect

        const myReqId = ++reqIdRef.current;

        const run = async () => {
            setStatus("checking");

            // ✅ локальная проверка (тихо)
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

                const json = await res.json().catch(() => null);
                const ok = !!json?.available;

                if (reqIdRef.current === myReqId) setStatus(ok ? "available" : "unavailable");
            } catch {
                // ❗️без ошибок — просто "нет"
                if (reqIdRef.current === myReqId) setStatus("unavailable");
            }
        };

        // небольшой debounce, чтобы не дергать API пока человек допечатывает
        const t = window.setTimeout(run, 250);
        return () => window.clearTimeout(t);
    }, [postcode]);

    const handleContinue = () => {
        setPostcodeVerified(true);
        setStep(1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <h1 className="text-3xl font-semibold mb-3">Check Availability</h1>
            <p className="text-gray-500 mb-8">
                Enter your postal code to see if we currently serve your area.
            </p>

            <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="PLZ"
                value={postcode}
                onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setPostcode(v);
                    setStatus(v.length === 5 ? "checking" : "idle");
                }}
                className="
          w-full max-w-sm px-6 py-4
          text-center text-base font-medium tracking-widest
          border border-gray-200 rounded-2xl
          focus:outline-none focus:ring-2 focus:ring-gray-900
        "
            />

            {status === "checking" && (
                <div className="mt-4 text-sm text-gray-400">Checking…</div>
            )}

            {status === "available" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-1">Available</div>
                    <div className="opacity-80 mb-5">We serve PLZ {postcode}.</div>
                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition"
                    >
                        Continue →
                    </button>
                </div>
            )}

            {status === "unavailable" && (
                <div className="w-full max-w-md p-6 bg-gray-900 rounded-2xl text-white text-center animate-fadeIn mt-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="text-lg font-semibold mb-1">Not available</div>
                    <div className="opacity-80">We don’t serve PLZ {postcode} yet.</div>
                </div>
            )}
        </div>
    );
}