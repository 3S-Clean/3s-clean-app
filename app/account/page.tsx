import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";
import { Logo } from "@/components/ui/Logo"; // ✅ добавь путь как у тебя в проекте

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-white px-4 py-10 flex items-center justify-center">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">

                {/* ✅ LOGO */}
                <div className="mb-6 flex items-center justify-center">
                    <a
                        href="https://s3-final.webflow.io/"
                        aria-label="Go to main website"
                        className="inline-flex items-center justify-center cursor-pointer transition text-black/70 hover:text-black/40"
                    >
                        <Logo className="h-14 w-14" />
                    </a>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-black text-center">
                    Account
                </h1>

                <p className="mt-3 text-sm text-black/55 text-center">
                    Signed in as <span className="text-black">{user.email}</span>
                </p>

                <div className="mt-10">
                    <LogoutButton />
                </div>
            </div>
        </main>
    );
}