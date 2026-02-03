"use client";

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
                "min-w-0 text-left text-[var(--text)]",
                "text-[15px] leading-[1.2rem] md:text-lg",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}