"use client";

import {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {createClient} from "@/shared/lib/supabase/client";
import {AUTH_CARD_BASE, CARD_FRAME_BASE} from "@/shared/ui/card/CardFrame";

function ChangePassword() {
    const t = useTranslations("account.settings.changePassword");

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

            const {error} = await supabase.auth.updateUser({
                password: newPassword.trim(),
            });

            if (error) {
                setErr(error.message);
                return;
            }

            setSuccess(t("success"));
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : t("errors.generic");
            setErr(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={[CARD_FRAME_BASE, "mt-6 p-4"].join(" ")}>
            <h3 className="text-lg font-semibold text-[var(--text)]">{t("title")}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{t("subtitle")}</p>

            <div className="mt-4 grid gap-3">
                <div className="grid gap-1">
                    <label className="text-sm text-[var(--muted)]">{t("labels.newPassword")}</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={[
                            "h-11 w-full",
                            AUTH_CARD_BASE,
                            "rounded-xl px-3 text-[15px]",
                            "bg-transparent",
                            "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                            "outline-none transition-all duration-200",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                            "active:scale-[0.99]",
                        ].join(" ")}
                        placeholder={t("placeholders.password")}
                        autoComplete="new-password"
                    />
                </div>

                <div className="grid gap-1">
                    <label className="text-sm text-[var(--muted)]">{t("labels.confirmPassword")}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={[
                            "h-11 w-full",
                            AUTH_CARD_BASE,
                            "rounded-xl px-3 text-[15px]",
                            "bg-transparent",
                            "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                            "outline-none transition-all duration-200",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                            "active:scale-[0.99]",
                        ].join(" ")}
                        placeholder={t("placeholders.confirm")}
                        autoComplete="new-password"
                    />
                </div>

                {err && <p className="text-sm text-red-600">{err}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <button
                    onClick={onChangePassword}
                    disabled={!canSubmit || loading}
                    className={[
                        "h-11 rounded-xl px-4 text-sm font-medium transition disabled:opacity-40",
                        "bg-gray-900 text-white hover:bg-gray-800",
                        "dark:bg-white dark:text-gray-900 dark:hover:bg-white/90",
                    ].join(" ")}
                >
                    {loading ? t("cta.loading") : t("cta.default")}
                </button>
            </div>
        </section>
    );
}

function DeleteAccount() {
    const t = useTranslations("account.settings.deleteAccount");

    const [confirm, setConfirm] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canDelete = useMemo(() => confirm.trim().toUpperCase() === "DELETE", [confirm]);

    const run = async () => {
        setErr(null);
        setLoading(true);

        try {
            const res = await fetch("/api/account/delete", {method: "POST"});
            const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErr(data.error ?? t("errors.generic"));
                return;
            }

            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/signup";
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : t("errors.generic");
            setErr(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={[CARD_FRAME_BASE, "mt-6 p-4"].join(" ")}>
            <h3 className="text-lg font-semibold text-[var(--text)]">{t("title")}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{t("subtitle")}</p>

            <button
                onClick={() => setOpen(true)}
                className="mt-4 block h-11 mx-auto rounded-xl border border-red-600/30 bg-red-600/10 px-4 text-sm font-medium text-red-700"
            >
                {t("cta.open")}
            </button>

            {open && (
                <div className={[CARD_FRAME_BASE, "mt-4 p-4"].join(" ")}>
                    <p className="text-sm text-[var(--muted)]">
                        {t("confirmHintPrefix")} <b>DELETE</b> {t("confirmHintSuffix")}
                    </p>

                    <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="DELETE"
                        className={[
                            "mt-3 h-11 w-full",
                            AUTH_CARD_BASE,
                            "rounded-xl px-3 text-[15px]",
                            "bg-transparent",
                            "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                            "outline-none transition-all duration-200",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                            "active:scale-[0.99]",
                        ].join(" ")}
                    />

                    {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

                    <div className="mt-4 flex gap-2">
                        <button
                            disabled={loading}
                            onClick={() => setOpen(false)}
                            className="h-11 flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[var(--card)]/70 text-sm font-medium text-[var(--text)]"
                        >
                            {t("cta.cancel")}
                        </button>

                        <button
                            disabled={!canDelete || loading}
                            onClick={run}
                            className="h-11 flex-1 rounded-xl bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-40"
                        >
                            {loading ? t("cta.deleting") : t("cta.confirm")}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Settings() {
    const t = useTranslations("account.settings");

    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-[var(--text)] md:text-2xl">
                {t("title")}
            </h2>

            <div className="mx-auto mt-6 max-w-xl text-left">
                <ChangePassword/>
                <DeleteAccount/>
            </div>
        </div>
    );
}