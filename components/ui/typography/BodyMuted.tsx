// components/ui/typography/BodyMuted.tsx
import type React from "react";

export default function BodyMuted({
                                      children,
                                      className = "",
                                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={[
                "text-[var(--muted)]",
                "text-[clamp(13px,1.6vw,15px)]",
                "leading-[1.35]",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}