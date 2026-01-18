// components/booking/PostcodeCheck.tsx
"use client";

import { useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";
import { checkPostalCode, createNotifyRequest } from "@/lib/booking/actions";
import { useBookingStore } from "@/lib/booking/store";

function ProgressDots({ step }: { step: number }) {
    const total = 5;
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }, (_, i) => {
                const isDone = i < step;
                const isNow = i === step;
                return (
                    <span
                        key={i}
                        className={[
                            "h-2.5 w-2.5 rounded-full transition",
                            isDone ? "bg-black" : isNow ? "bg-white border border-black" : "bg-black/20",
                            isNow ? "scale-110" : "",
                        ].join(" ")}
                    />
                );
            })}
        </div>
    );
}

export default function PostcodeCheck() {
    const { setStep, setPostcode, setPostcodeVerified } = useBookingStore();

    const [plz, setPlz] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const normalized = useMemo(() => plz.replace(/\D/g, "").slice(0, 5), [plz]);
    const canSubmit = normalized.length === 5 && !loading;

    async function onCheck() {
        if (!canSubmit) return;
        setLoading(true);
        setStatus(null);
        try {
            const res = await checkPostalCode(normalized);
            if (res.available) {
                setPostcode(normalized);
                setPostcodeVerified(true);
                setStep(1);
            } else {
                setPostcodeVerified(false);
                setStatus("We don’t serve this area yet. Leave your email and we’ll notify you.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function onNotify(email: string) {
        if (!email) return;
        await createNotifyRequest(email, normalized);
        setStatus("Thanks! We’ll email you when your area is available.");
    }

    return (
        <div className="w-full max-w-md mx-auto px-4">
            <div className="pt-6">
                <ProgressDots step={0} />
            </div>

            <div className="mt-8 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-[#0B1220] flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-white" />
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black">Check Availability</h1>
                <p className="mt-3 text-base text-black/55">
                    Enter your postal code to see if we serve your area
                </p>

                <div className="mt-8 w-full relative">
                    <input
                        value={normalized}
                        onChange={(e) => setPlz(e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="postal-code"
                        placeholder="Enter PLZ (e.g., 70173)"
                        className="w-full h-14 rounded-2xl border border-black/10 bg-white/60 px-4 text-center text-xl font-semibold tracking-wide
                       placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-black/35
                       focus:outline-none focus:ring-2 focus:ring-black/10"
                    />

                    {normalized.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setPlz("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
                            aria-label="Clear"
                        >
                            <X className="h-4 w-4 text-black/70" />
                        </button>
                    )}
                </div>

                <button
                    onClick={onCheck}
                    disabled={!canSubmit}
                    className={[
                        "mt-4 w-full h-14 rounded-full font-medium transition",
                        canSubmit ? "bg-[#0B1220] text-white" : "bg-black/15 text-white/70",
                    ].join(" ")}
                >
                    {loading ? "Checking..." : "Check"}
                </button>

                {status && (
                    <div className="mt-8 w-full text-sm text-black/55">
                        <p>{status}</p>

                        {!loading && normalized.length === 5 && status.includes("Leave your email") && (
                            <NotifyInline onSubmit={onNotify} />
                        )}
                    </div>
                )}

                <div className="mt-16 text-xs text-black/35 tracking-widest font-semibold">
                    CURRENTLY SERVING
                </div>
                <div className="mt-2 text-sm text-black/55">
                    Stuttgart City Center (70173-70199), Vaihingen, Möhringen, Degerloch, Feuerbach, Weilimdorf
                </div>
            </div>
        </div>
    );
}

function NotifyInline({ onSubmit }: { onSubmit: (email: string) => Promise<void> }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div className="mt-4 w-full">
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                placeholder="Email"
                className="w-full h-12 rounded-2xl border border-black/10 bg-white/60 px-4 text-sm
                   placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
                className="mt-3 w-full h-12 rounded-full bg-black text-white font-medium disabled:bg-black/20"
                disabled={!email.includes("@") || loading}
                onClick={async () => {
                    setLoading(true);
                    try {
                        await onSubmit(email);
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {loading ? "Submitting..." : "Notify me"}
            </button>
        </div>
    );
}