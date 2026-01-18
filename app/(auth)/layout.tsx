import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const viewport = {
    themeColor: "#ffffff",
};

const WEBFLOW_URL = "https://s3-final.webflow.io/";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-[#fafafa]">
            <div className="w-full max-w-md">
                <div className="mb-10 flex items-center justify-center">
                    <Link
                        href={WEBFLOW_URL}
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center cursor-pointer transition duration-200 ease-out text-black/70 hover:text-black/40 focus:outline-none focus-visible:outline-none"
                    >
                        <Logo className="h-14 w-14" />
                    </Link>
                </div>

                <div className="rounded-[28px] border border-black/10 bg-white/55 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
                    <Suspense
                        fallback={
                            <div className="text-center">
                                <div className="animate-pulse text-black/50">Loading…</div>
                            </div>
                        }
                    >
                        {children}
                    </Suspense>
                </div>
            </div>
        </main>
    );
}