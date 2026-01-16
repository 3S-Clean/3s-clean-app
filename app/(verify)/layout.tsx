import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

const WEBFLOW_URL = "https://s3-final.webflow.io/";

export default function VerifyLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-6 py-10 flex items-center justify-center bg-[var(--bg)]">
            <div className="w-full max-w-md text-center">
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

                {/* без карточки */}
                <div className="text-[color:var(--text)]">
                    {children}
                </div>
            </div>
        </main>
    );
}