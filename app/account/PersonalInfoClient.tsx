"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

export default function PersonalInfoClient({ email }: { email: string }) {
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
        country: "Germany",
    });

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: u, error: uErr } = await supabase.auth.getUser();
            const user = u?.user;

            if (uErr || !user) {
                setError("Not authenticated.");
                setLoading(false);
                return;
            }

            const { data, error: pErr } = await supabase
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
                country: p?.country ?? "Germany",
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
            const { data: u } = await supabase.auth.getUser();
            const user = u?.user;

            if (!user) {
                setError("Not authenticated.");
                setSaving(false);
                return;
            }

            // ✅ в профиле делаем как в booking: основные поля обязательны
            const first_name = form.first_name.trim();
            const last_name = form.last_name.trim();
            const phone = form.phone.trim();
            const address = form.address.trim();
            const city = form.city.trim();
            const postal_code = form.postal_code.trim();
            const country = form.country.trim() || "Germany";

            if (!first_name || !last_name) {
                setError("Please fill first name and last name.");
                setSaving(false);
                return;
            }
            if (!phone) {
                setError("Please fill phone.");
                setSaving(false);
                return;
            }
            if (!address) {
                setError("Please fill address.");
                setSaving(false);
                return;
            }
            if (!postal_code || postal_code.length !== 5) {
                setError("Please fill a valid postal code (5 digits).");
                setSaving(false);
                return;
            }
            if (!city) {
                setError("Please fill city.");
                setSaving(false);
                return;
            }

            const { error: upErr } = await supabase
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
                    { onConflict: "id" }
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
                <h2 className="text-xl font-semibold text-black md:text-2xl text-center">Personal Information</h2>
                <p className="mt-4 text-black/55 text-center">Loading…</p>
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
                <h2 className="text-xl font-semibold text-black md:text-2xl">Personal Information</h2>

                {!editing && hasAny ? (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Edit
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
                                country: profile?.country ?? "Germany",
                            });
                        }}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Cancel
                    </button>
                ) : null}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {/* EMPTY STATE */}
            {!editing && !hasAny && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-5">
                    <p className="text-[15px] font-medium text-black">Complete your profile</p>
                    <p className="mt-1 text-sm text-black/55">
                        Add your details so booking is faster next time.
                    </p>

                    <div className="mt-4 text-sm text-black/70">
                        <span className="font-medium">Email:</span> {email}
                    </div>

                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="mt-5 w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90"
                    >
                        Add details
                    </button>
                </div>
            )}

            {/* DISPLAY (только заполненные поля) */}
            {!editing && hasAny && (
                <div className="mt-6 space-y-2 text-[15px] text-black/80">
                    {isFilled(profile?.first_name) || isFilled(profile?.last_name) ? (
                        <p className="font-medium text-black">
                            {[profile?.first_name, profile?.last_name].filter((x) => isFilled(x)).join(" ")}
                        </p>
                    ) : null}

                    {isFilled(profile?.phone) ? <p>{profile?.phone}</p> : null}

                    {/* адрес строкой, без пустот */}
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

            {/* EDIT FORM (все поля как booking) */}
            {editing && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
                    <Field label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />

                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                    <Field
                        label="Postal code"
                        value={form.postal_code}
                        onChange={(v) => setForm({ ...form, postal_code: v.replace(/\D/g, "").slice(0, 5) })}
                        inputMode="numeric"
                    />

                    <div className="md:col-span-2">
                        <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                    </div>

                    <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                    <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                    <div className="md:col-span-2 mt-2">
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="w-full rounded-2xl bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving…" : "Save changes"}
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
            <label className="text-sm font-medium text-black/70">{label}</label>
            <input
                value={value}
                inputMode={inputMode}
                onChange={(e) => onChange(e.target.value)}
                className={[
                    "w-full rounded-2xl border bg-white/70 backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
                    "placeholder:text-black/35",
                    "focus:ring-2 focus:ring-black/10 focus:border-black/20",
                    "border-black/10",
                ].join(" ")}
            />
        </div>
    );
}