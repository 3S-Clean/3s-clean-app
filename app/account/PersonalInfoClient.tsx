"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
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
                .select("id, first_name, last_name, phone")
                .eq("id", user.id)
                .maybeSingle();

            if (pErr) {
                setError(pErr.message);
                setLoading(false);
                return;
            }

            // ⚠️ Не создаём пустую запись автоматически — чтобы не было мусора
            setProfile((data as Profile) ?? null);

            setForm({
                first_name: data?.first_name ?? "",
                last_name: data?.last_name ?? "",
                phone: data?.phone ?? "",
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

            if (!form.first_name.trim() || !form.last_name.trim()) {
                setError("Please fill first name and last name.");
                setSaving(false);
                return;
            }

            const { error: upErr } = await supabase.from("profiles").upsert(
                {
                    id: user.id,
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone: form.phone.trim() || null,
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

    const hasName = isFilled(profile?.first_name) && isFilled(profile?.last_name);
    const hasPhone = isFilled(profile?.phone);
    const hasAny = hasName || hasPhone; // “профиль не пустой”

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
                            });
                        }}
                        className="text-sm text-black/60 transition hover:text-black"
                    >
                        Cancel
                    </button>
                ) : null}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {/* ✅ EMPTY STATE: никакого "—", никаких пустых строк */}
            {!editing && !hasAny && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-5">
                    <p className="text-[15px] font-medium text-black">Complete your profile</p>
                    <p className="mt-1 text-sm text-black/55">
                        Add your name and phone number so booking is faster next time.
                    </p>

                    <div className="mt-4 space-y-2">
                        <div className="text-sm text-black/70">
                            <span className="font-medium">Email:</span> {email}
                        </div>
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

            {/* ✅ DISPLAY: показываем только существующие поля */}
            {!editing && hasAny && (
                <div className="mt-6 space-y-2 text-[15px] text-black/80">
                    {hasName && (
                        <p className="font-medium text-black">
                            {profile?.first_name} {profile?.last_name}
                        </p>
                    )}
                    {hasPhone && <p>{profile?.phone}</p>}
                    <p>{email}</p>
                </div>
            )}

            {/* ✅ EDIT FORM: тут поля есть всегда */}
            {editing && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
                    <Field label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

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