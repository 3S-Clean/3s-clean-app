"use client";

import { useState } from "react";

export default function EmailConfirmPage() {
    const [email] = useState<string | null>(() => {
        try {
            return localStorage.getItem("pendingEmail");
        } catch {
            return null;
        }
    });

    return (
        <>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
                Check your email
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-black/55">
                We’ve sent a verification link to{" "}
                <span className="text-black font-medium">
          {email ?? "your email address"}
        </span>
                .
            </p>

            <p className="mt-8 text-sm text-black/45">
                You can safely close this tab now.
            </p>

            <p className="mt-4 text-xs text-black/40">
                If you have any issues confirming your account, please contact{" "}
                <a
                    href="mailto:support@3s-clean.com"
                    className="underline hover:text-black"
                >
                    support@3s-clean.com
                </a>
            </p>
        </>
    );
}