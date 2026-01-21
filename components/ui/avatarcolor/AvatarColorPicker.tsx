"use client";

import React, { useEffect, useRef, useState } from "react";

export const AVATAR_COLORS = [
    "#EAF7FF",
    "#F2FBF7",
    "#ECFDF5",
    "#F5F3FF",
    "#FFF7ED",
    "#FDF2F8",
] as const;

type Props = {
    value?: string | null;
    onChange: (color: string) => Promise<void> | void;
    disabled?: boolean;
};

export function AvatarColorPicker({ value, onChange, disabled }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!open) return;
            const t = e.target as Node;
            if (ref.current && !ref.current.contains(t)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    const selected = value?.trim().toUpperCase() || null;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                aria-label="Change avatar color"
                className="grid h-[30px] w-[30px] place-items-center rounded-full border border-black/10 bg-white/80 backdrop-blur-md transition hover:bg-white disabled:opacity-50"
            >
                {/* простая “палитра” */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black/70">
                    <path
                        d="M12 3a9 9 0 1 0 0 18h2a3 3 0 0 0 0-6h-1a1 1 0 0 1 0-2h1a5 5 0 0 1 0 10h-2A11 11 0 1 1 23 12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <circle cx="8" cy="10" r="1.2" fill="currentColor" />
                    <circle cx="12" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="10" r="1.2" fill="currentColor" />
                    <circle cx="10" cy="14" r="1.2" fill="currentColor" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[38px] z-50 grid grid-cols-6 gap-2 rounded-2xl border border-black/10 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
                    {AVATAR_COLORS.map((c) => {
                        const isActive = selected === c.toUpperCase();
                        return (
                            <button
                                key={c}
                                type="button"
                                aria-label={`Set color ${c}`}
                                onClick={async () => {
                                    await onChange(c);
                                    setOpen(false);
                                }}
                                className={[
                                    "h-[22px] w-[22px] rounded-full border transition",
                                    isActive ? "border-[#11A97D] border-2" : "border-black/10",
                                ].join(" ")}
                                style={{ background: c }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}