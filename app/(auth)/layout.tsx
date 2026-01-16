// app/(auth)/layout.tsx
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

const WEBFLOW_URL = "https://s3-final.webflow.io/";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-[var(--background)]">
            <div className="w-full max-w-md">
                <div className="mb-10 flex items-center justify-center">
                    <a
                        href={WEBFLOW_URL}
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center transition duration-200 ease-out
                       text-[color:var(--muted)] hover:opacity-70"
                    >
                        <Logo className="h-14 w-14" />
                    </a>
                </div>

                <div
                    className="rounded-[28px] border backdrop-blur-xl p-8 md:p-10"
                    style={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                        boxShadow: "var(--shadow)",
                    }}
                >
                    {children}
                </div>
            </div>
        </main>
    );
}