"use client";

import type React from "react";
import Link from "next/link";

export default function PillCTA({
                                    href,
                                    children,
                                    className = "",
                                }: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    const base = [
        "block w-full text-center font-semibold rounded-full",
        "py-2.5",
        "transition-all border",
        "bg-gray-900 text-white border-gray-900",
        "hover:bg-white hover:text-gray-900 hover:border-gray-900",
        "dark:bg-white dark:text-gray-900 dark:border-white/20",
        "dark:hover:bg-gray-900 dark:hover:text-white dark:hover:border-white/20",
    ].join(" ");

    return (
        <Link href={href} className={[base, className].filter(Boolean).join(" ")}>
            {children}
        </Link>
    );
}