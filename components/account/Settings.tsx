"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function ChangePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        const a = newPassword.trim();
        const b = confirmPassword.trim();
        return a.length >= 8 && a === b;
    }, [newPassword, confirmPassword]);

    const onChangePassword = async () => {
        setErr(null);
        setSuccess(null);
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.updateUser({
                password: newPassword.trim(),
            });

            if (error) {
                setErr(error.message);
                setLoading(false);
                return;
            }

            setSuccess("Password updated.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Password update failed";
            setErr(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
            <h3 className="text-lg font-semibold text-black">Security</h3>
            <p className="mt-1 text-sm text-black/60">
                Change your password. Minimum 8 characters.
            </p>

            <div className="mt-4 grid gap-3">
                <div className="grid gap-1">
                    <label className="text-sm text-black/70">New password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-black/10 px-3 outline-none focus:border-black/25"
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </div>

                <div className="grid gap-1">
                    <label className="text-sm text-black/70">Confirm password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-black/10 px-3 outline-none focus:border-black/25"
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </div>

                {err && <p className="text-sm text-red-600">{err}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <button
                    onClick={onChangePassword}
                    disabled={!canSubmit || loading}
                    className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-40"
                >
                    {loading ? "Updating..." : "Change password"}
                </button>
            </div>
        </section>
    );
}

function DeleteAccount() {
    const [confirm, setConfirm] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canDelete = useMemo(
        () => confirm.trim().toUpperCase() === "DELETE",
        [confirm]
    );

    const run = async () => {
        setErr(null);
        setLoading(true);

        try {
            const res = await fetch("/api/account/delete", { method: "POST" });
            const data: { ok?: boolean; error?: string } = await res
                .json()
                .catch(() => ({}));

            if (!res.ok) {
                setErr(data.error ?? "Delete failed");
                setLoading(false);
                return;
            }

            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/signup";
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Delete failed";
            setErr(message);
            setLoading(false);
        }
    };

    return (
        <section className="mt-6 rounded-2xl border  bg-white p-4">
            <h3 className="text-lg font-semibold text-black">Danger zone</h3>
            <p className="mt-1 text-sm text-black/60">
                Deleting your account is permanent. Orders will be kept for accounting,
                but personal data in orders will be anonymized.
            </p>
            <button
                onClick={() => setOpen(true)}
                className="mt-4 block h-11 mx-auto rounded-xl border border-red-600/30 bg-red-600/10 px-4 text-sm font-medium text-red-700"
            >
                Delete account
            </button>
            {open && (
                <div className="mt-4 rounded-2xl border border-black/10 p-4">
                    <p className="text-sm text-black/70">
                        Type <b>DELETE</b> to confirm.
                    </p>

                    <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="DELETE"
                        className="mt-3 h-11 w-full rounded-xl border border-black/10 px-3 outline-none focus:border-black/25"
                    />

                    {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

                    <div className="mt-4 flex gap-2">
                        <button
                            disabled={loading}
                            onClick={() => setOpen(false)}
                            className="h-11 flex-1 rounded-xl border border-black/10 bg-white text-sm font-medium text-black"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={!canDelete || loading}
                            onClick={run}
                            className="h-11 flex-1 rounded-xl bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-40"
                        >
                            {loading ? "Deleting..." : "Confirm delete"}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Settings() {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-black md:text-2xl">
                Settings
            </h2>

            <div className="mx-auto mt-6 max-w-xl text-left">
                <ChangePassword />
                <DeleteAccount />
            </div>
        </div>
    );
}