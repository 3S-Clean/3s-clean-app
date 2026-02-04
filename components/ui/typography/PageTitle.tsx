// components/ui/typography/PageTitle.tsx
import type React from "react";

export default function PageTitle({
                                      children,
                                      className = "",
                                  }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h1
            className={[
                "font-sans font-semibold tracking-[-0.02em] text-[var(--text)]",
                "leading-[0.98]",
                "text-[clamp(44px,6.2vw,88px)]",
                "xl:text-[clamp(44px,5.4vw,96px)]",
                className,
            ].join(" ")}
        >
            {children}
        </h1>
    );
}