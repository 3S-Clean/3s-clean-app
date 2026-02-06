import React from "react";

type AvatarProps = {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    color?: string | null; // из profiles.avatar_color
    seed?: string | null; // fallback: user.id / email
    size?: number; // px
    className?: string;
};

function getInitials(first?: string | null, last?: string | null, email?: string | null) {
    const f = (first || "").trim();
    const l = (last || "").trim();

    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f[0].toUpperCase();
    if (l) return l[0].toUpperCase();

    const e = (email || "").trim();
    if (e) return e[0].toUpperCase();

    return "?";
}

function fnv1a32(str: string) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
}

const FALLBACK_COLORS = ["#EAF7FF", "#F2FBF7", "#ECFDF5", "#F5F3FF", "#FFF7ED", "#FDF2F8"] as const;

function pickFallbackColor(seed: string) {
    const idx = fnv1a32(seed) % FALLBACK_COLORS.length;
    return FALLBACK_COLORS[idx];
}

export function Avatar({
                           firstName,
                           lastName,
                           email,
                           color,
                           seed,
                           size = 44,
                           className,
                       }: AvatarProps) {
    const initials = getInitials(firstName, lastName, email);
    const bg = color?.trim() || pickFallbackColor((seed || email || "default").trim());

    return (
        <div
            className={[
                "grid place-items-center rounded-full select-none",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.80),0_10px_24px_rgba(0,0,0,0.10)]",
                "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_14px_34px_rgba(0,0,0,0.55)]",
                className || "",
            ].join(" ")}
            style={{
                width: size,
                height: size,
                background: bg,
            }}
            aria-label="Avatar"
        >
      <span className="font-semibold text-[14px] tracking-wide text-[rgb(26,26,26)]">
        {initials}
      </span>
        </div>
    );
}