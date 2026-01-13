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

    // 1️⃣ Читаем результат Supabase
    useEffect(() => {
        const hp = getHashParams();

        if (hp.error) {
            setDesc(hp.error_description || "The link may be expired or already used.");
            setState("failed");
        }
    }, []);

    // 2️⃣ Если всё ок — просто редирект
    useEffect(() => {
        if (state === "working") {
            router.replace("/confirmed");
        }
    }, [state, router]);

    // ❌ ошибка подтверждения
    if (state === "failed") {
        return (
            <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
                <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                    <h1 className="text-2xl font-semibold text-black">Confirmation failed</h1>
                    <p className="mt-4 text-sm text-black/55">{desc}</p>

                    <Link
                        href="/login"
                        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                    >
                        Go to login
                    </Link>
                </div>
            </main>
        );
    }

    // ⏳ промежуточное состояние
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                <h1 className="text-2xl font-semibold text-black">Confirming…</h1>
                <p className="mt-4 text-sm text-black/55">Please wait.</p>
            </div>
        </main>
    );
}