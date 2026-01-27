import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo/Logo";
import Link from "next/link";
export const viewport: Viewport = {
    themeColor: "#ffffff",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-[var(--background)]">
            <div className="w-full max-w-md">
                <div className="mb-10 flex items-center justify-center">
                    <Link
                        href="/#"
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center cursor-pointer transition duration-200 ease-out text-[color:var(--muted)] hover:opacity-70 focus:outline-none focus-visible:outline-none"
                        rel="noopener noreferrer"
                    >
                        <Logo className="h-14 w-14" />
                    </Link>
                </div>

                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl shadow-[var(--shadow)] p-8">
                    <Suspense
                        fallback={
                            <div className="text-center">
                                <div className="animate-pulse text-[color:var(--muted)]">Loading…</div>
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