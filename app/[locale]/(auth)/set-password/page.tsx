"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export default function SetPasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<null | { type: "error" | "ok"; msg: string }>(null);
    const [loading, setLoading] = useState(false);

    const validatePassword = (value: string): string | null => {
        if (value.length < 8) return "Minimum 8 characters";
        if (!/[A-Z]/.test(value)) return "Must contain at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Must contain at least one number";
        return null;
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const {data, error} = await supabase.auth.getSession();
            if (cancelled) return;

            const ok = !!data.session && !error;
            setHasSession(ok);

            if (!ok) {
                router.replace("/signup");
                router.refresh();
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase, router]);

    const submit = async () => {
        setStatus(null);

        const passwordError = validatePassword(password);
        if (passwordError) {
            setStatus({type: "error", msg: passwordError});
            return;
        }

        if (password !== confirm) {
            setStatus({type: "error", msg: "Passwords do not match."});
            return;
        }

        setLoading(true);
        try {
            const {error} = await supabase.auth.updateUser({password});

            if (error) {
                setStatus({type: "error", msg: error.message});
                return;
            }

            try {
                localStorage.removeItem("pendingEmail");
            } catch {
            }

            setStatus({type: "ok", msg: "Password set successfully."});

            router.replace("/account");
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    if (hasSession === null) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-[color:var(--text)]">Loading…</h1>
                <p className="mt-4 text-sm text-[color:var(--muted)]">Please wait.</p>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)]">
                Set password
            </h1>

            <p className="mt-6 text-base text-[color:var(--muted)]">
                Create a password for future logins (email + password).
            </p>

            <div className="mt-10 space-y-4">
                <input
                    type="password"
                    placeholder="New password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={[
                        "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                        "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                        "placeholder:text-[color:var(--muted)]/70",
                        "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                    ].join(" ")}
                />

                <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={[
                        "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition backdrop-blur",
                        "bg-[var(--input-bg)] border-[var(--input-border)] text-[color:var(--text)]",
                        "placeholder:text-[color:var(--muted)]/70",
                        "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--input-border)]",
                    ].join(" ")}
                />
                {/* primary: light black / dark white */}
                <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className={[
                        "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                        "disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90",
                        "bg-black text-white",
                        "dark:bg-white dark:text-black",
                    ].join(" ")}
                >
                    {loading ? "Saving…" : "Save password"}
                </button>
                {status && (
                    <p
                        className={[
                            "text-sm",
                            status.type === "ok" ? "text-[color:var(--status-ok)]" : "text-red-500/90",
                        ].join(" ")}
                    >
                        {status.msg}
                    </p>
                )}
            </div>
            <p className="mt-10 text-sm text-[color:var(--muted)]">
                If you have any issues, contact{" "}
                <a className="text-[color:var(--text)] hover:underline" href="mailto:support@3s-clean.com">
                    support@3s-clean.com
                </a>
                .
            </p>
        </div>
    );
}