"use client";

import type React from "react";

export default function SectionKicker({
                                          children,
                                          className = "",
                                      }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={[
                "inline-block whitespace-nowrap",
                "font-sans font-bold text-left text-[var(--text)] mb-6",
                "tracking-[0.05em]",
                "text-[23px] leading-[2.2rem]",
                "sm:text-[26px] sm:leading-[2rem]",
                "md:text-[29px] md:leading-[2rem]",
                "xl:text-[32px] xl:leading-[3rem]",
                className,
            ].join(" ")}
        >
            {children}
        </p>
    );
}