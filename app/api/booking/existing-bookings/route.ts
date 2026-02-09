import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";
import {
    isAwaitingPaymentExpired,
    isBlockingForSchedule,
} from "@/shared/lib/orders/lifecycle";

type Body = { startDate?: string; endDate?: string };
type BookingRow = {
    id: string;
    scheduled_date: string;
    scheduled_time: string;
    estimated_hours: number | null;
    status: string | null;
    created_at: string | null;
    payment_due_at?: string | null;
};

type PostgrestErrorLike = {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
};

function isMissingPaymentDueColumn(error: PostgrestErrorLike | null) {
    if (!error) return false;
    const joined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
    return error.code === "42703" && joined.includes("payment_due_at");
}

export async function POST(req: Request) {
    let body: Body = {};
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json([], {status: 200});
    }

    const {startDate, endDate} = body;

    if (!startDate || !endDate) return NextResponse.json([], {status: 200});

    const supabase = createSupabaseAdminClient();

    const readRes = await supabase
        .from("orders")
        .select("id, scheduled_date, scheduled_time, estimated_hours, status, created_at, payment_due_at")
        .gte("scheduled_date", String(startDate))
        .lte("scheduled_date", String(endDate))
        .in("status", [
            "awaiting_payment",
            "payment_pending",
            "paid",
            "reserved",
            "in_progress",
            // legacy compatibility
            "pending",
            "confirmed",
        ]);

    let rows = (readRes.data ?? []) as BookingRow[];
    let readError = readRes.error as PostgrestErrorLike | null;
    if (isMissingPaymentDueColumn(readError)) {
        const fallbackRes = await supabase
            .from("orders")
            .select("id, scheduled_date, scheduled_time, estimated_hours, status, created_at")
            .gte("scheduled_date", String(startDate))
            .lte("scheduled_date", String(endDate))
            .in("status", [
                "awaiting_payment",
                "payment_pending",
                "paid",
                "reserved",
                "in_progress",
                // legacy compatibility
                "pending",
                "confirmed",
            ]);
        rows = (fallbackRes.data ?? []) as BookingRow[];
        readError = fallbackRes.error as PostgrestErrorLike | null;
    }

    if (readError) return NextResponse.json({error: readError.message}, {status: 500});

    const now = Date.now();

    const overdueAwaiting = rows
        .filter((row) => isAwaitingPaymentExpired(row, now))
        .map((row) => row.id);
    if (overdueAwaiting.length > 0) {
        await supabase
            .from("orders")
            .update({
                status: "expired",
            })
            .in("id", overdueAwaiting)
            .in("status", ["awaiting_payment", "pending"]);
    }

    const activeBookings = rows
        .filter((row) => isBlockingForSchedule(row, now))
        .map((row) => ({
            scheduled_date: row.scheduled_date,
            scheduled_time: row.scheduled_time,
            estimated_hours: Number(row.estimated_hours) || 0,
        }));

    return NextResponse.json(activeBookings, {status: 200});
}
