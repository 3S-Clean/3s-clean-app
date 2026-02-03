import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: {user},
        error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect("/login");

    // Берём данные из profiles
    const {data: profile} = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_color")
        .eq("id", user.id)
        .single();

    return (
        <AccountClient
            userId={user.id}
            email={user.email ?? ""}
            firstName={profile?.first_name ?? null}
            lastName={profile?.last_name ?? null}
            avatarColor={profile?.avatar_color ?? null}
        />
    );
}