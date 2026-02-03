"use client";

import type React from "react";

type As = "h2" | "h3" | "p" | "span";

type Props = {
    as?: As;
    children: React.ReactNode;
    className?: string;
};

export default function BigTitle({
                                     as = "span",
                                     children,
                                     className = "",
                                 }: Props) {
    const Comp: React.ElementType = as;

    return (
        <Comp
            className={[
                "min-w-0",
                "font-sans font-semibold tracking-[0em] text-[var(--text)]",
                "text-[43px] leading-[4rem]",
                "sm:text-[48px] sm:leading-[4rem]",
                "md:text-[50px] md:leading-[3rem]",
                "xl:text-[52px] xl:leading-[3rem]",
                className,
            ].join(" ")}
        >
            {children}
        </Comp>
    );
}