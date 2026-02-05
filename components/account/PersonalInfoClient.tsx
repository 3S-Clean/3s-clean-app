"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {createClient} from "@/lib/supabase/client";
import {AUTH_CARD_BASE} from "@/components/ui/card/CardFrame";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
};

function isFilled(v: string | null | undefined) {
    return typeof v === "string" && v.trim().length > 0;
}

function getErrorMessage(e: unknown): string {
    if (e instanceof Error && e.message) return e.message;
    if (typeof e === "string") return e;
    return "Something went wrong.";
}

export default function PersonalInfoClient({email}: { email: string }) {
    const t = useTranslations("account.personalInfo");
    const supabase = useMemo(() => createClient(), []);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: t("defaults.country"),
    });

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const {data: u, error: uErr} = await supabase.auth.getUser();
            const user = u?.user;

            if (uErr || !user) {
                setError(t("errors.notAuthenticated"));
                setLoading(false);
                return;
            }

            const {data, error: pErr} = await supabase
                .from("profiles")
                .select("id, first_name, last_name, phone, address, city, postal_code, country")
                .eq("id", user.id)
                .maybeSingle();

            if (pErr) {
                setError(pErr.message);
                setLoading(false);
                return;
            }

            const p = (data as Profile) ?? null;
            setProfile(p);

            setForm({
                first_name: p?.first_name ?? "",
                last_name: p?.last_name ?? "",
                phone: p?.phone ?? "",
                address: p?.address ?? "",
                city: p?.city ?? "",
                postal_code: p?.postal_code ?? "",
                country: p?.country ?? t("defaults.country"),
            });

            setLoading(false);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSave = async () => {
        if (saving) return;

        setSaving(true);
        setError(null);

        try {
            const {data: u} = await supabase.auth.getUser();
            const user = u?.user;

            if (!user) {
                setError(t("errors.notAuthenticated"));
                setSaving(false);
                return;
            }

            const first_name = form.first_name.trim();
            const last_name = form.last_name.trim();
            const phone = form.phone.trim();
            const address = form.address.trim();
            const city = form.city.trim();
            const postal_code = form.postal_code.trim();
            const country = form.country.trim() || t("defaults.country");

            if (!first_name || !last_name) {
                setError(t("errors.fillFirstLast"));
                setSaving(false);
                return;
            }
            if (!phone) {
                setError(t("errors.fillPhone"));
                setSaving(false);
                return;
            }
            if (!address) {
                setError(t("errors.fillAddress"));
                setSaving(false);
                return;
            }
            if (!postal_code || postal_code.length !== 5) {
                setError(t("errors.invalidPostal"));
                setSaving(false);
                return;
            }
            if (!city) {
                setError(t("errors.fillCity"));
                setSaving(false);
                return;
            }

            const {error: upErr} = await supabase
                .from("profiles")
                .upsert(
                    {
                        id: user.id,
                        first_name,
                        last_name,
                        phone,
                        address,
                        city,
                        postal_code,
                        country,
                    },
                    {onConflict: "id"}
                );

            if (upErr) {
                setError(upErr.message);
                setSaving(false);
                return;
            }

            setSaving(false);
            setEditing(false);
            await load();
        } catch (e: unknown) {
            setError(getErrorMessage(e));
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h2 className="text-xl font-semibold text-[var(--text)] md:text-2xl text-center">{t("title")}</h2>
                <p className="mt-4 text-[var(--muted)] text-center">{t("loading")}</p>
            </div>
        );
    }

    const hasAny =
        isFilled(profile?.first_name) ||
        isFilled(profile?.last_name) ||
        isFilled(profile?.phone) ||
        isFilled(profile?.address) ||
        isFilled(profile?.city) ||
        isFilled(profile?.postal_code) ||
        isFilled(profile?.country);

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-[var(--text)] md:text-2xl">{t("title")}</h2>

                {!editing && hasAny ? (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
                    >
                        {t("actions.edit")}
                    </button>
                ) : null}

                {editing ? (
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(false);
                            setError(null);
                            setForm({
                                first_name: profile?.first_name ?? "",
                                last_name: profile?.last_name ?? "",
                                phone: profile?.phone ?? "",
                                address: profile?.address ?? "",
                                city: profile?.city ?? "",
                                postal_code: profile?.postal_code ?? "",
                                country: profile?.country ?? t("defaults.country"),
                            });
                        }}
                        className="text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
                    >
                        {t("actions.cancel")}
                    </button>
                ) : null}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {/* EMPTY STATE */}
            {!editing && !hasAny && (
                <div
                    className="mt-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-[var(--card)]/70 backdrop-blur p-5">
                    <p className="text-[15px] font-medium text-[var(--text)]">{t("empty.title")}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{t("empty.subtitle")}</p>

                    <div className="mt-4 text-sm text-[var(--muted)]">
                        <span className="font-medium text-[var(--text)]">{t("empty.emailLabel")}</span> {email}
                    </div>

                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className={[
                            "mt-5 w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                            "bg-gray-900 text-white hover:bg-gray-800",
                            "dark:bg-white dark:text-gray-900 dark:hover:bg-white/90",
                        ].join(" ")}
                    >
                        {t("empty.cta")}
                    </button>
                </div>
            )}

            {/* DISPLAY (only filled fields) */}
            {!editing && hasAny && (
                <div className="mt-6 space-y-2 text-[15px] text-[var(--muted)]">
                    {isFilled(profile?.first_name) || isFilled(profile?.last_name) ? (
                        <p className="font-medium text-[var(--text)]">
                            {[profile?.first_name, profile?.last_name].filter((x) => isFilled(x)).join(" ")}
                        </p>
                    ) : null}

                    {isFilled(profile?.phone) ? <p>{profile?.phone}</p> : null}

                    {isFilled(profile?.address) || isFilled(profile?.postal_code) || isFilled(profile?.city) ? (
                        <p>
                            {[profile?.address, [profile?.postal_code, profile?.city].filter((x) => isFilled(x)).join(" ")]
                                .filter((x) => isFilled(x))
                                .join(", ")}
                        </p>
                    ) : null}

                    {isFilled(profile?.country) ? <p>{profile?.country}</p> : null}

                    <p>{email}</p>
                </div>
            )}

            {/* EDIT FORM */}
            {editing && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label={t("fields.firstName")} value={form.first_name}
                           onChange={(v) => setForm({...form, first_name: v})}/>
                    <Field label={t("fields.lastName")} value={form.last_name}
                           onChange={(v) => setForm({...form, last_name: v})}/>

                    <Field label={t("fields.phone")} value={form.phone} onChange={(v) => setForm({...form, phone: v})}/>
                    <Field
                        label={t("fields.postalCode")}
                        value={form.postal_code}
                        onChange={(v) => setForm({...form, postal_code: v.replace(/\D/g, "").slice(0, 5)})}
                        inputMode="numeric"
                    />

                    <div className="md:col-span-2">
                        <Field label={t("fields.address")} value={form.address}
                               onChange={(v) => setForm({...form, address: v})}/>
                    </div>

                    <Field label={t("fields.city")} value={form.city} onChange={(v) => setForm({...form, city: v})}/>
                    <Field label={t("fields.country")} value={form.country}
                           onChange={(v) => setForm({...form, country: v})}/>

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className={[
                                "w-full rounded-2xl py-3.5 text-[15px] font-medium transition",
                                "bg-gray-900 text-white hover:bg-gray-800",
                                "dark:bg-white dark:text-gray-900 dark:hover:bg-white/90",
                                "disabled:opacity-40 disabled:cursor-not-allowed",
                            ].join(" ")}
                        >
                            {saving ? t("actions.saving") : t("actions.save")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({
                   label,
                   value,
                   onChange,
                   inputMode,
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--muted)]">{label}</label>
            <input
                value={value}
                inputMode={inputMode}
                onChange={(e) => onChange(e.target.value)}
                className={[
                    "w-full",
                    AUTH_CARD_BASE,
                    "rounded-2xl px-4 py-3.5 text-[15px]",
                    "bg-transparent",
                    "text-[color:var(--text)] placeholder:text-[color:var(--muted)]/70",
                    "outline-none transition-all duration-200",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-black/10 dark:focus-visible:ring-white/10",
                    "active:scale-[0.99]",
                ].join(" ")}
            />
        </div>
    );
}