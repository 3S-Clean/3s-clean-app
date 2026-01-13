"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmailConfirmedPage() {
    const router = useRouter();
    const [sec, setSec] = useState(3);

    useEffect(() => {
        const t1 = window.setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
        const t2 = window.setTimeout(() => {
            router.replace("/login?justSignedUp=1");
            router.refresh();
        }, 3000);

        return () => {
            window.clearInterval(t1);
            window.clearTimeout(t2);
        };
    }, [router]);

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-black">Confirm your email</h1>
                <p className="mt-4 text-sm text-black/55">
                    We’ve sent a confirmation link to your email address. Please open your inbox and confirm your email.
                </p>

                <p className="mt-6 text-sm text-black/55">
                    Redirecting to login in <span className="text-black">{sec}s</span>…
                </p>

                <div className="mt-8 space-y-3">
                    <a
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                        href="mailto:"
                    >
                        Open Mail
                    </a>

                    <p className="text-xs text-black/45">
                        On iPhone, “Open Mail” may start a new draft — just close it and open your Inbox.
                    </p>

                    <p className="pt-2 text-sm text-black/55">
                        Already confirmed?{" "}
                        <Link className="text-black hover:underline" href="/login">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}