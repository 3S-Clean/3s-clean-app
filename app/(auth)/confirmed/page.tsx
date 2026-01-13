import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function Page() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
                    <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">
                        <h1 className="text-3xl font-semibold tracking-tight text-black">
                            Email confirmed
                        </h1>
                        <p className="mt-6 text-sm text-black/55">Loading…</p>
                    </div>
                </main>
            }
        >
            <ConfirmedClient />
        </Suspense>
    );
}