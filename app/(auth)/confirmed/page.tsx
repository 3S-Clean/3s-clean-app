import Link from "next/link";

export default function ConfirmedPage() {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-black">Email confirmed</h1>
                <p className="mt-4 text-sm text-black/55">
                    Thank you — your email has been confirmed successfully.
                </p>

                <p className="mt-6 text-sm text-black/45">
                    You can close this tab now.
                </p>

                <Link
                    href="/login?confirmed=1"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/90"
                >
                    Go to login
                </Link>
            </div>
        </main>
    );
}