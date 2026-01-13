import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthCallbackPage({
                                                   searchParams,
                                               }: {
    searchParams: { code?: string; next?: string };
}) {
    const supabase = await createSupabaseServerClient();

    const code = searchParams.code;
    const next = searchParams.next ?? "/account";

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        // если ошибка — отправь на логин с ошибкой
        if (error) redirect("/login?error=confirm_failed");
    }

    redirect(next);
}