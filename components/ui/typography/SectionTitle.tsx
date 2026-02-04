// components/ui/typography/SectionTitle.tsx
import type React from "react";

export default function SectionTitle({
                                         children,
                                         className = "",
                                     }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={[
                "font-sans font-semibold tracking-[-0.01em] text-[var(--text)]",
                "text-[clamp(22px,2.4vw,30px)] leading-[1.1]",
                "leading-[1.05]",
                className,
            ].join(" ")}
        >
            {children}
        </h2>
    );
}