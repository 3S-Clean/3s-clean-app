"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type State = "working" | "failed";

function getHashParams() {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        error: params.get("error"),
        error_description: params.get("error_description"),
    };
}

export default function CallbackPage() {
    const router = useRouter();
    const [state, setState] = useState<State>("working");
    const [desc, setDesc] = useState("");

    useEffect(() => {
        const hp = getHashParams();

        if (hp.error) {
            queueMicrotask(() => {
                setDesc(hp.error_description || "Email link is invalid or has expired.");
                setState("failed");
            });
            return;
        }

        router.replace("/confirmed");
    }, [router]);

    if (state === "failed") {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-black">Confirmation failed</h1>
                <p className="mt-4 text-sm text-black/55">{desc}</p>

                <Link
                    href="/login"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                >
                    Go to login
                </Link>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-2xl font-semibold text-black">Confirming…</h1>
            <p className="mt-4 text-sm text-black/55">Please wait.</p>
        </div>
    );
}