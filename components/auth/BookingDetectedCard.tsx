import type React from "react";
import {AUTH_CARD_BASE} from "@/components/ui/card/CardFrame";


export default function BookingDetectedCard({
                                                text,
                                                className = "",
                                            }: {
    text: string;
    className?: string;
}) {
    return (
        <div
            className={[
                "rounded-2xl px-4 py-3",
                AUTH_CARD_BASE,
                "bg-[var(--input-bg)]/60 backdrop-blur",
                className,
            ].join(" ")}
        >
            <p className="text-sm text-[color:var(--muted)]">{text}</p>
        </div>
    );
}