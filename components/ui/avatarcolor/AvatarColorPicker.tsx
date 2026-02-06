"use client";

import React, {useEffect, useRef, useState} from "react";
import {Droplet} from "lucide-react";

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
    onChangeAction: (color: string) => Promise<void> | void;
    disabled?: boolean;
};

export function AvatarColorPicker({value, onChangeAction, disabled}: Props) {
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
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                aria-label="Change avatar color"
                className={[
                    "p-1",
                    "text-[rgb(26,26,26)]/55 dark:text-white/70",
                    "transition-opacity duration-200 hover:opacity-70",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
                    "disabled:opacity-40",
                ].join(" ")}
            >
                <Droplet size={18} strokeWidth={1.75}/>
            </button>

            {/* Picker */}
            {open && (
                <div
                    className={[
                        "absolute right-0 top-full mt-2 z-[999]",
                        "flex items-center gap-2",
                        "rounded-2xl p-3",
                        "overflow-hidden",
                        "bg-[rgba(255,255,255,0.70)] dark:bg-[rgba(0,0,0,0.35)]",
                        "backdrop-blur-[20px] backdrop-saturate-[180%]",
                        "shadow-[0_12px_34px_rgba(0,0,0,0.14)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.55)]",
                        "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
                        "before:rounded-2xl",
                        "before:opacity-100 dark:before:opacity-0",
                        "before:[background:linear-gradient(135deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.10)_66%,rgba(0,0,0,0)_100%)]",
                    ].join(" ")}
                >
                    {AVATAR_COLORS.map((c) => {
                        const isActive = selected === c.toUpperCase();

                        return (
                            <button
                                key={c}
                                type="button"
                                onClick={async () => {
                                    await onChangeAction(c);
                                    setOpen(false);
                                }}
                                aria-label={`Set avatar color ${c}`}
                                className={[
                                    "relative",
                                    "h-7 w-7 rounded-full",
                                    "transition-transform duration-150",
                                    "hover:scale-110 active:scale-105",
                                    "ring-1 ring-black/10 dark:ring-white/10",
                                    isActive ? "ring-2 ring-[#11A97D]" : "",
                                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
                                ].join(" ")}
                                style={{background: c}}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}