import {NextResponse} from "next/server";
import {createSupabaseAdminClient} from "@/shared/lib/supabase/admin";

type Body = { startDate?: string; endDate?: string };
type BookingRow = {
    scheduled_date: string;
    scheduled_time: string;
    estimated_hours: number | null;
    status: string | null;
    created_at: string | null;
};

const PENDING_HOLD_MS = 30 * 60 * 1000;

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

    const {data, error} = await supabase
        .from("orders")
        .select("scheduled_date, scheduled_time, estimated_hours, status, created_at")
        .gte("scheduled_date", String(startDate))
        .lte("scheduled_date", String(endDate))
        .in("status", ["pending", "confirmed", "in_progress"]);

    if (error) return NextResponse.json({error: error.message}, {status: 500});

    const rows = (data ?? []) as BookingRow[];
    const now = Date.now();

    const activeBookings = rows
        .filter((row) => {
            if (row.status !== "pending") return true;
            const createdAt = row.created_at ? Date.parse(row.created_at) : NaN;
            if (Number.isNaN(createdAt)) return false;
            return now - createdAt <= PENDING_HOLD_MS;
        })
        .map((row) => ({
            scheduled_date: row.scheduled_date,
            scheduled_time: row.scheduled_time,
            estimated_hours: Number(row.estimated_hours) || 0,
        }));

    return NextResponse.json(activeBookings, {status: 200});
}
