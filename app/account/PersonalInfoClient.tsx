"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
};

type Address = {
    id: string;
    user_id: string;
    is_default: boolean;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    street: string;
    city: string;
    postal_code: string;
    country: string;
};

export default function PersonalInfoClient({ email }: { email: string }) {
    const supabase = useMemo(() => createClient(), []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [address, setAddress] = useState<Address | null>(null);

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        street: "",
        city: "",
        postal_code: "",
        country: "Germany",
    });

    const load = async () => {
        setLoading(true);
        setError(null);

        const { data: u, error: uErr } = await supabase.auth.getUser();
        const user = u?.user;

        if (uErr || !user) {
            setError("Not authenticated.");
            setLoading(false);
            return;
        }

        // PROFILE
        const p = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, phone")
            .eq("user_id", user.id)
            .maybeSingle();

        // если профиля нет — создаём пустой
        if (!p.data && !p.error) {
            await supabase.from("profiles").insert({ user_id: user.id });
        }

        const p2 = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, phone")
            .eq("user_id", user.id)
            .maybeSingle();

        // DEFAULT ADDRESS
        const a = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .order("created_at", { ascending: false })
            .maybeSingle();

        if (p2.error) setError(p2.error.message);
        if (a.error) setError(a.error.message);

        setProfile(p2.data ?? null);
        setAddress(a.data ?? null);

        // заполняем форму
        const firstName = p2.data?.first_name ?? a.data?.first_name ?? "";
        const lastName = p2.data?.last_name ?? a.data?.last_name ?? "";
        const phone = p2.data?.phone ?? a.data?.phone ?? "";

        setForm({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            street: a.data?.street ?? "",
            city: a.data?.city ?? "",
            postal_code: a.data?.postal_code ?? "",
            country: a.data?.country ?? "Germany",
        });

        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSave = async () => {
        setSaving(true);
        setError(null);

        const { data: u } = await supabase.auth.getUser();
        const user = u?.user;
        if (!user) {
            setError("Not authenticated.");
            setSaving(false);
            return;
        }

        // минимальная валидация
        if (!form.first_name.trim() || !form.last_name.trim()) {
            setError("Please fill first name and last name.");
            setSaving(false);
            return;
        }

        // 1) PROFILE upsert
        const upP = await supabase.from("profiles").upsert(
            {
                user_id: user.id,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone: form.phone.trim() || null,
            },
            { onConflict: "user_id" }
        );

        if (upP.error) {
            setError(upP.error.message);
            setSaving(false);
            return;
        }

        // 2) ADDRESS (default)
        if (address?.id) {
            const upA = await supabase
                .from("addresses")
                .update({
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone: form.phone.trim() || null,
                    email: email || null,
                    street: form.street.trim(),
                    city: form.city.trim(),
                    postal_code: form.postal_code.trim(),
                    country: form.country.trim() || "Germany",
                })
                .eq("id", address.id);

            if (upA.error) {
                setError(upA.error.message);
                setSaving(false);
                return;
            }
        } else {
            // если адреса нет — создаём default
            if (!form.street.trim() || !form.city.trim() || !form.postal_code.trim()) {
                setError("Please fill street, city and postal code.");
                setSaving(false);
                return;
            }

            const insA = await supabase.from("addresses").insert({
                user_id: user.id,
                is_default: true,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone: form.phone.trim() || null,
                email: email || null,
                street: form.street.trim(),
                city: form.city.trim(),
                postal_code: form.postal_code.trim(),
                country: form.country.trim() || "Germany",
            });

            if (insA.error) {
                setError(insA.error.message);
                setSaving(false);
                return;
            }
        }

        setSaving(false);
        setEditing(false);
        await load();
    };

    if (loading) {
        return (
            <div>
                <h2 className="text-xl font-semibold text-black md:text-2xl text-center">
                    Personal Information
                </h2>
                <p className="mt-4 text-black/55 text-center">Loading…</p>
            </div>
        );
    }

    const fullName =
        (profile?.first_name ?? address?.first_name ?? "—") +
        " " +
        (profile?.last_name ?? address?.last_name ?? "");

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-black md:text-2xl">
                    Personal Information
                </h2>

                {!editing ? (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Edit
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(false);
                            setError(null);
                            // откатим поля на текущие значения
                            setForm({
                                first_name: profile?.first_name ?? address?.first_name ?? "",
                                last_name: profile?.last_name ?? address?.last_name ?? "",
                                phone: profile?.phone ?? address?.phone ?? "",
                                street: address?.street ?? "",
                                city: address?.city ?? "",
                                postal_code: address?.postal_code ?? "",
                                country: address?.country ?? "Germany",
                            });
                        }}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {!editing ? (
                <div className="mt-6 space-y-1 text-[15px] text-black/80">
                    <p className="font-medium text-black">{fullName}</p>
                    <p>{address?.street ?? "—"}</p>
                    <p>{address?.city ?? "—"}</p>
                    <p>
                        {(address?.country ?? "Germany")} {address?.postal_code ?? ""}
                    </p>
                    <p>{profile?.phone ?? address?.phone ?? "—"}</p>
                    <p>{address?.email ?? email}</p>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
                    <Field label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                    <Field label="Street" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
                    <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                    <Field label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
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
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-black/70">{label}</label>
            <input
                value={value}
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