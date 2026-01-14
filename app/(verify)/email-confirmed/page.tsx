"use client";

import { useEffect, useState } from "react";

export default function EmailConfirmedPage() {
    const [email, setEmail] = useState<string | null>(null);

    // читаем pendingEmail один раз после mount
    useEffect(() => {
        try {
            const v = localStorage.getItem("pendingEmail");
            setEmail(v);
        } catch {
            setEmail(null);
        }
    }, []);

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-black">
                Check your email
            </h1>

            <p className="mt-6 text-base text-black/55">
                We&apos;ve sent a verification link to{" "}
                <span className="text-black font-medium">
          {email ?? "your email address"}
        </span>
                .
            </p>

            <p className="mt-6 text-sm text-black/45">
                You can safely close this tab now.
            </p>

            <p className="mt-10 text-sm text-black/40">
                If you have any issues confirming your account, please contact{" "}
                <a
                    href="mailto:support@3s-clean.com"
                    className="text-black hover:underline"
                >
                    support@3s-clean.com
                </a>
                .
            </p>
        </div>
    );
}