import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient(); // ✅ теперь await

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect("/login");

    return <AccountClient email={user.email ?? ""} />;
}