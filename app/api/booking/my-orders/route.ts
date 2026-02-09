import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    isAwaitingPaymentExpired,
    normalizeDisplayStatus,
} from "@/shared/lib/orders/lifecycle";

type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};

type OrderRow = {
    id: string;
    user_id: string | null;
    status: string | null;
    payment_due_at?: string | null;
    created_at: string | null;
    [key: string]: unknown;
};

function isMissingPaymentDueColumn(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && joined.includes("payment_due_at");
}

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const {
        data: {user},
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const admin = createSupabaseAdminClient();
    const select = `
        id,status,payment_due_at,service_type,apartment_size,people_count,scheduled_date,scheduled_time,estimated_hours,total_price,created_at,extras
    `;
    const selectFallback = select.replace("payment_due_at,", "");

    const primaryRes = await admin
        .from("orders")
        .select(select)
        .eq("user_id", user.id)
        .order("scheduled_date", {ascending: true})
        .order("scheduled_time", {ascending: true});
    let rowsData = primaryRes.data as OrderRow[] | null;
    let queryError = primaryRes.error as PostgrestErrorLike | null;

    if (isMissingPaymentDueColumn(queryError)) {
        const fallbackRes = await admin
            .from("orders")
            .select(selectFallback)
            .eq("user_id", user.id)
            .order("scheduled_date", {ascending: true})
            .order("scheduled_time", {ascending: true});
        rowsData = fallbackRes.data as OrderRow[] | null;
        queryError = fallbackRes.error as PostgrestErrorLike | null;
    }

    if (queryError) {
        return NextResponse.json({error: queryError.message ?? "Failed to load orders"}, {status: 500});
    }

    const rows = rowsData ?? [];
    const nowMs = Date.now();
    const overdueIds = rows.filter((row) => isAwaitingPaymentExpired(row, nowMs)).map((row) => row.id);

    if (overdueIds.length > 0) {
        await admin
            .from("orders")
            .update({
                status: "expired",
            })
            .in("id", overdueIds)
            .in("status", ["awaiting_payment", "pending"])
            .eq("user_id", user.id);
    }

    const normalized = rows.map((row) => ({
        ...row,
        status: normalizeDisplayStatus(row, nowMs),
    }));

    return NextResponse.json({orders: normalized}, {status: 200});
}
