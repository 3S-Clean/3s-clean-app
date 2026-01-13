import Link from "next/link";

export default function EmailConfirmedPage({
                                               searchParams,
                                           }: {
    searchParams: { email?: string };
}) {
    const email = searchParams.email ? decodeURIComponent(searchParams.email) : null;

    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                    Confirm your email
                </h1>

                <p className="mt-4 text-sm text-black/55">
                    We’ve sent a confirmation link{email ? <> to <span className="text-black">{email}</span></> : null}.
                    <br />
                    Please open your inbox and confirm your email.
                </p>

                {/* Open Mail (iOS может открыть draft — это нормально) */}
                <a
                    href={email ? `mailto:${encodeURIComponent(email)}` : "mailto:"}
                    className="mt-8 block w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                >
                    Open Mail
                </a>

                {/* Web mail fallback */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <a
                        href="https://mail.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-black/10 py-2 hover:bg-black/5"
                    >
                        Gmail
                    </a>
                    <a
                        href="https://www.icloud.com/mail"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-black/10 py-2 hover:bg-black/5"
                    >
                        iCloud
                    </a>
                    <a
                        href="https://outlook.live.com/mail/"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-black/10 py-2 hover:bg-black/5"
                    >
                        Outlook
                    </a>
                </div>

                <p className="mt-6 text-xs text-black/40">
                    On iPhone, “Open Mail” may start a new draft — just close it and open your Inbox.
                </p>

                <p className="mt-6 text-sm text-black/55">
                    Already confirmed?{" "}
                    <Link href="/login" className="text-black hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}