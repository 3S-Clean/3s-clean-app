import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo/Logo";
import Link from "next/link";


export default function VerifyLayout({ children }: { children: ReactNode }) {
    return (
        <main
            className="min-h-screen px-6 py-10 flex items-center justify-center bg-[var(--background)]"
            style={{ colorScheme: "light dark" }}
        >
            <div className="w-full max-w-md text-center">
                <div className="mb-10 flex items-center justify-center">
                    <Link
                        href="/public#"
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center transition duration-200 ease-out
                       text-[color:var(--muted)] hover:opacity-70"
                    >
                        <Logo className="h-14 w-14" />
                    </Link>
                </div>

                <div className="text-[color:var(--text)] focus:outline-none">
                    {children}
                </div>
            </div>
        </main>
    );
}