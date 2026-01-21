import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect("/login");

    // 👉 берём имя из profiles
    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

    return (
        <AccountClient
            email={user.email ?? ""}
            firstName={profile?.first_name ?? null}
        />
    );
}