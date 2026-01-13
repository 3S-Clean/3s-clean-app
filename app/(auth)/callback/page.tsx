import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthCallbackPage({
                                                   searchParams,
                                               }: {
    searchParams: { code?: string };
}) {
    const supabase = await createSupabaseServerClient();

    const code = searchParams.code;
    if (!code) redirect("/login?error=missing_code");

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect("/login?error=confirm_failed");

    // ✅ подтверждено → сразу на логин
    redirect("/login?confirmed=1");
}