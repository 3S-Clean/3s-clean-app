"use client";

import {useMemo, useRef} from "react";
import {CARD_FRAME_BASE} from "@/shared/ui/card/CardFrame";

export default function OtpBoxes({
                                     value,
                                     onChangeAction,
                                     length = 8,
                                 }: {
    value: string;
    onChangeAction: (next: string) => void;
    length?: number;
}) {
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const digits = useMemo(() => {
        return Array.from({length}, (_, i) => value[i] ?? "");
    }, [value, length]);

    return (
        <div className="grid grid-cols-8 gap-2">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    value={d}
                    onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (!v) {
                            const next = digits.slice();
                            next[i] = "";
                            onChangeAction(next.join("").replace(/\D/g, "").slice(0, length));
                            return;
                        }

                        const chunk = v.slice(0, length - i).split("");
                        const next = digits.slice();
                        for (let k = 0; k < chunk.length; k++) next[i + k] = chunk[k];
                        onChangeAction(next.join("").replace(/\D/g, "").slice(0, length));
                        const nextIndex = Math.min(i + chunk.length, length - 1);
                        refs.current[nextIndex]?.focus();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                            e.preventDefault();
                            if (digits[i]) {
                                const next = digits.slice();
                                next[i] = "";
                                onChangeAction(next.join("").replace(/\D/g, "").slice(0, length));
                            } else {
                                const prev = Math.max(i - 1, 0);
                                const next = digits.slice();
                                next[prev] = "";
                                onChangeAction(next.join("").replace(/\D/g, "").slice(0, length));
                                refs.current[prev]?.focus();
                            }
                        }
                        if (e.key === "ArrowLeft") refs.current[Math.max(i - 1, 0)]?.focus();
                        if (e.key === "ArrowRight") refs.current[Math.min(i + 1, length - 1)]?.focus();
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                        if (!pasted) return;
                        onChangeAction(pasted);
                        refs.current[Math.min(pasted.length, length - 1)]?.focus();
                    }}
                    className={[
                        CARD_FRAME_BASE,
                        "h-12 w-full rounded-2xl bg-transparent",
                        "text-center text-[16px] font-medium tabular-nums",
                        "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                        "outline-none transition-all duration-200",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                    ].join(" ")}
                    maxLength={1}
                />
            ))}
        </div>
    );
}