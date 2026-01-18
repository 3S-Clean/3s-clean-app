import { getOrderSuccess } from "@/lib/booking/actions";

export default async function BookingSuccessPage({
                                                     searchParams,
                                                 }: {
    searchParams: { token?: string };
}) {
    const token = (searchParams?.token ?? "").trim();
    const order = token ? await getOrderSuccess(token) : null;

    return (
        <main className="min-h-screen px-4 py-12 bg-[#f6f5f2]">
            <div className="mx-auto w-full max-w-2xl">
                <div className="rounded-[28px] border border-black/10 bg-white/60 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                    <h1 className="text-2xl font-semibold tracking-tight text-black">Booking confirmed</h1>
                    <p className="mt-2 text-sm text-black/55">
                        Thank you. Here are your details:
                    </p>

                    {!order ? (
                        <p className="mt-6 text-sm text-black/60">
                            We can’t load booking details right now.
                        </p>
                    ) : (
                        <div className="mt-6 grid gap-3 text-sm text-black/70">
                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Service</div>
                                <div className="mt-1 font-medium text-black/75">{order.service_type}</div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Date & time</div>
                                <div className="mt-1 font-medium text-black/75">
                                    {String(order.scheduled_date)} • {String(order.scheduled_time)} • ~{Number(order.estimated_hours)}h
                                </div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Address</div>
                                <div className="mt-1 font-medium text-black/75">
                                    {String(order.customer_address)} • {String(order.customer_postal_code)}
                                </div>
                            </div>

                            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
                                <div className="text-xs text-black/50">Total</div>
                                <div className="mt-1 text-xl font-semibold tracking-tight text-black">
                                    € {Number(order.total_price).toFixed(2)}
                                </div>
                                <div className="mt-1 text-sm text-black/55">inc. VAT</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}