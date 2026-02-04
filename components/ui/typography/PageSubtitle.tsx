// components/ui/typography/PageSubtitle.tsx
import type React from "react";

export default function PageSubtitle({
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
                "text-[clamp(16px,2.0vw,20px)]",
                "leading-[1.35]",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}