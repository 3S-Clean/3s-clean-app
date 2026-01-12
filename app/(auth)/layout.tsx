import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

const WEBFLOW_URL = "https://s3-final.webflow.io/";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-[radial-gradient(1200px_800px_at_20%_20%,#EAF7FF_0%,transparent_60%),radial-gradient(900px_700px_at_80%_30%,#F2FBF7_0%,transparent_55%),linear-gradient(180deg,#FFFFFF_0%,#F2FBF7_40%,#EAF7FF_100%)]">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-10 flex items-center justify-center">
                    <a
                        href={WEBFLOW_URL}
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center cursor-pointer transition duration-200 ease-out text-black/70 hover:text-black/40 focus:outline-none focus-visible:outline-none"
                    >
                        <Logo className="h-14 w-14" />
                    </a>
                </div>

                {/* Card */}
                <div className="rounded-[28px] border border-black/10 bg-white/55 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">
                    {children}
                </div>
            </div>
        </main>
    );
}