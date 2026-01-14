"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    street: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
};

export default function PersonalInfoClient() {
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<Profile | null>(null);

    // локальная форма
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        street: "",
        city: "",
        postal_code: "",
        country: "Germany",
    });

    // 1) загрузка профиля
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);

            const { data: u, error: uErr } = await supabase.auth.getUser();
            if (uErr || !u.user) {
                if (!cancelled) setError("Not authenticated.");
                if (!cancelled) setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", u.user.id)
                .maybeSingle();

            if (cancelled) return;

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setProfile(data ?? null);

            // заполняем форму
            setForm({
                first_name: data?.first_name ?? "",
                last_name: data?.last_name ?? "",
                phone: data?.phone ?? "",
                street: data?.street ?? "",
                city: data?.city ?? "",
                postal_code: data?.postal_code ?? "",
                country: data?.country ?? "Germany",
            });

            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    // 2) сохранение
    const onSave = async () => {
        setSaving(true);
        setError(null);

        const { data: u, error: uErr } = await supabase.auth.getUser();
        if (uErr || !u.user) {
            setError("Not authenticated.");
            setSaving(false);
            return;
        }

        const payload = {
            user_id: u.user.id,
            first_name: form.first_name || null,
            last_name: form.last_name || null,
            phone: form.phone || null,
            street: form.street || null,
            city: form.city || null,
            postal_code: form.postal_code || null,
            country: form.country || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("profiles")
            .upsert(payload, { onConflict: "user_id" })
            .select()
            .single();

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        setProfile(data);
        setEditing(false);
        setSaving(false);
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
                        onClick={() => setEditing(false)}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {!editing ? (
                <div className="mt-6 space-y-1 text-[15px] text-black/80">
                    <p className="font-medium text-black">
                        {(profile?.first_name ?? "—")} {(profile?.last_name ?? "")}
                    </p>
                    <p>{profile?.street ?? "—"}</p>
                    <p>{profile?.city ?? "—"}</p>
                    <p>
                        {(profile?.country ?? "—")} {(profile?.postal_code ?? "")}
                    </p>
                    <p>{profile?.phone ?? "—"}</p>
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