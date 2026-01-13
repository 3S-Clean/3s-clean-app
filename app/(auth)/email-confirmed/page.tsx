"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailConfirmPage() {
    const router = useRouter();
    const [sec, setSec] = useState(8);

    useEffect(() => {
        const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
        const go = setTimeout(() => router.replace("/login"), 3200);
        return () => { clearInterval(t); clearTimeout(go); };
    }, [router]);

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-black">Confirm your email</h1>

                <p className="mt-4 text-sm text-black/55">
                    We’ve sent a confirmation link to your email address. Please open your inbox and confirm your email.
                </p>

                <p className="mt-6 text-sm text-black/55">
                    Redirecting to login in <span className="text-black">{sec}s</span>…
                </p>

                <div className="mt-8 space-y-3">
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