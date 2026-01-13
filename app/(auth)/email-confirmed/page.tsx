"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 15;

export default function EmailConfirmPage() {
    const [sec, setSec] = useState(REDIRECT_SECONDS);

    useEffect(() => {
        const tick = setInterval(() => {
            setSec((s) => (s > 0 ? s - 1 : 0));
        }, 1000);

        const go = setTimeout(() => {
            window.location.replace("/login");
        }, REDIRECT_SECONDS * 1000);

        return () => {
            clearInterval(tick);
            clearTimeout(go);
        };
    }, []);

    return (
        <>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
                Confirm your email
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-black/55">
                We’ve sent a confirmation link to your email address.
                Please open your inbox and confirm your email.
            </p>

            <p className="mt-6 text-sm text-black/55">
                Redirecting to login in{" "}
                <span className="text-black">{sec}s</span>…
            </p>

            <div className="mt-8">
                <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90 transition"
                >
                    Go to login
                </Link>
            </div>
        </>
    );
}