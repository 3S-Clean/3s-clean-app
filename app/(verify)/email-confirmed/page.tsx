"use client";

import Link from "next/link";

export default function ConfirmedPage() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-black">
                Email confirmed
            </h1>

            <p className="mt-6 text-base text-black/55">
                Thank you — your email has been confirmed successfully.
            </p>

            <Link
                href="/login"
                className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
            >
                Continue to login
            </Link>

            <p className="mt-10 text-sm text-black/40">
                If you have any issues confirming your account, please contact{" "}
                <a href="mailto:support@3s-clean.com" className="text-black hover:underline">
                    support@3s-clean.com
                </a>
                .
            </p>
        </div>
    );
}