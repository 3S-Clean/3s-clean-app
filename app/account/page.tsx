import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-white px-4 py-10 flex items-center justify-center">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                    Account
                </h1>

                <p className="mt-3 text-sm text-black/55">
                    Signed in as <span className="text-black">{user.email}</span>
                </p>

                <div className="mt-10">
                    <LogoutButton />
                </div>
            </div>
        </main>
    );
}