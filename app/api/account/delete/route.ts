import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";

export async function POST() {
    // 1️⃣ кто вызывает?
    const supabase = await createSupabaseServerClient();
    const {data: {user}, error: userErr} = await supabase.auth.getUser();

    if (userErr || !user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const userId = user.id;
    const admin = createSupabaseAdminClient();

    // 2️⃣ анонимизируем PII в orders
    const {error: anonErr} = await admin
        .from("orders")
        .update({
            customer_email: null,
            customer_phone: null,
            customer_address: null,
            customer_notes: null,
            anonymized_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    if (anonErr) {
        return NextResponse.json(
            {error: `Failed to anonymize orders: ${anonErr.message}`},
            {status: 500}
        );
    }

    // 3️⃣ удаляем пользователя
    const {error: delErr} = await admin.auth.admin.deleteUser(userId);

    if (delErr) {
        return NextResponse.json(
            {error: `Failed to delete user: ${delErr.message}`},
            {status: 500}
        );
    }

    return NextResponse.json({ok: true});
}