// components/ui/typography/BodyText.tsx
import type React from "react";

export default function BodyText({
                                     children,
                                     className = "",
                                 }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={[
                "text-[var(--text)]",
                "text-[clamp(14px,1.6vw,17px)]",
                "leading-[1.35]",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}