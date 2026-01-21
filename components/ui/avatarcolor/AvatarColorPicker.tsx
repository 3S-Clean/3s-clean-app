"use client";

import React, { useEffect, useRef, useState } from "react";
import { Droplet } from "lucide-react";

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

export function AvatarColorPicker({ value, onChangeAction, disabled }: Props) {
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
                className="
          p-1
          text-black/50
          transition
          hover:text-black/80
          disabled:opacity-40
        "
            >
                <Droplet size={18} strokeWidth={1.75} />
            </button>

            {/* Picker */}
            {open && (
                <div
                    className="
            absolute right-0 top-full mt-2 z-[999]
            flex items-center gap-2
            rounded-2xl
            bg-white/95
            p-3
            shadow-xl
            backdrop-blur-xl
          "
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
                                    "h-7 w-7 rounded-full transition",
                                    isActive
                                        ? "ring-2 ring-[#11A97D]"
                                        : "hover:scale-110",
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