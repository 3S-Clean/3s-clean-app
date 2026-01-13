import Link from "next/link";

export default function ConfirmedPage() {
    return (
        <main className="min-h-screen px-4 py-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 text-center">

                <h1 className="text-3xl font-semibold tracking-tight text-black">
                    Confirm your email
                </h1>

                <p className="mt-4 text-sm text-black/55">
                    We’ve sent a confirmation link to your email address.
                    <br />
                    Please open your inbox and confirm your email.
                </p>

                {/* Open Mail */}
                <a
                    href="mailto:"
                    className="mt-8 block w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                >
                    Open Mail
                </a>

                {/* Web mail fallback */}
                <div className="mt-4 flex justify-center gap-4 text-sm">
                    <a
                        href="https://mail.google.com"
                        target="_blank"
                        className="text-black/60 hover:text-black underline"
                    >
                        Gmail
                    </a>
                    <a
                        href="https://www.icloud.com/mail"
                        target="_blank"
                        className="text-black/60 hover:text-black underline"
                    >
                        iCloud
                    </a>
                    <a
                        href="https://outlook.live.com"
                        target="_blank"
                        className="text-black/60 hover:text-black underline"
                    >
                        Outlook
                    </a>
                </div>

                <p className="mt-6 text-xs text-black/40">
                    You can close this tab after confirming.
                </p>

                <p className="mt-6 text-sm text-black/55">
                    After confirming, you can{" "}
                    <Link href="/login" className="text-black underline">
                        log in
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}