"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useBookingStore} from "@/features/booking/lib/store";
import {EXTRAS, getEstimatedHours, HOLIDAYS, TIME_SLOTS, WORKING_HOURS_END} from "@/features/booking/lib/config";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {isApartmentSizeId, isExtraId, isServiceId} from "@/features/booking/lib/guards";
import {CARD_FRAME_BASE, CARD_FRAME_INTERACTIVE} from "@/shared/ui";
import ReactMarkdown from "react-markdown";

type ExistingBookingRow = {
    scheduled_date: string;
    scheduled_time: string;
    estimated_hours: number;
};

type LegalDocId = "terms" | "privacy";

function CheckIcon() {
    return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
            <path
                d="M16.7 5.7 8.1 14.3 3.3 9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ContactSchedule() {
    const t = useTranslations("bookingSchedule.contactSchedule");
    const locale = useLocale();

    const {
        selectedService,
        apartmentSize,
        extras,
        formData,
        setFormData,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        termsRead,
        setTermsRead,
        privacyRead,
        setPrivacyRead,
        legalAccepted,
        setLegalAccepted,
        legalAcceptedAt,
        setLegalAcceptedAt,
    } = useBookingStore();

    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [existingBookings, setExistingBookings] = useState<ExistingBookingRow[]>([]);
    const [legalOpenDoc, setLegalOpenDoc] = useState<LegalDocId | null>(null);
    const [legalMarkdown, setLegalMarkdown] = useState("");
    const [legalLoading, setLegalLoading] = useState(false);
    const [legalLoadError, setLegalLoadError] = useState(false);
    const [legalScrolledToEnd, setLegalScrolledToEnd] = useState(false);
    const legalScrollRef = useRef<HTMLDivElement | null>(null);

    const estimatedMinutes = useMemo(() => {
        const baseHours =
            isServiceId(selectedService) && isApartmentSizeId(apartmentSize)
                ? getEstimatedHours(selectedService, apartmentSize)
                : 0;

        const extrasHours = Object.entries(extras || {}).reduce((sum, [id, qty]) => {
            if (!isExtraId(id)) return sum;
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.hours * (Number(qty) || 0) : 0);
        }, 0);

        return Math.max(0, Math.round((baseHours + extrasHours) * 60));
    }, [selectedService, apartmentSize, extras]);

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth();
            const start = new Date(y, m, 1).toISOString().split("T")[0];
            const end = new Date(y, m + 1, 0).toISOString().split("T")[0];

            try {
                const res = await fetch("/api/booking/existing-bookings", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({startDate: start, endDate: end}),
                    signal: controller.signal,
                });

                const json = (await res.json()) as ExistingBookingRow[];
                setExistingBookings(Array.isArray(json) ? json : []);
            } catch {
                setExistingBookings([]);
            }
        };

        void run();
        return () => controller.abort();
    }, [currentMonth]);

    useEffect(() => {
        if (!legalOpenDoc) return;
        const controller = new AbortController();

        setLegalLoading(true);
        setLegalLoadError(false);
        setLegalMarkdown("");
        setLegalScrolledToEnd(false);

        const run = async () => {
            try {
                const q = new URLSearchParams({doc: legalOpenDoc, locale});
                const res = await fetch(`/api/legal?${q.toString()}`, {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                });
                const json = (await res.json().catch(() => null)) as {markdown?: unknown} | null;

                if (!res.ok || !json || typeof json.markdown !== "string") {
                    throw new Error("legal-load-failed");
                }

                setLegalMarkdown(json.markdown);
            } catch {
                if (!controller.signal.aborted) setLegalLoadError(true);
            } finally {
                if (!controller.signal.aborted) setLegalLoading(false);
            }
        };

        void run();
        return () => controller.abort();
    }, [legalOpenDoc, locale]);

    useEffect(() => {
        if (!legalOpenDoc || legalLoading || legalLoadError) return;
        const el = legalScrollRef.current;
        if (!el) return;
        const noScroll = el.scrollHeight <= el.clientHeight + 4;
        if (noScroll) setLegalScrolledToEnd(true);
    }, [legalOpenDoc, legalLoading, legalLoadError, legalMarkdown]);

    useEffect(() => {
        if (termsRead && privacyRead) return;
        if (!legalAccepted && !legalAcceptedAt) return;
        setLegalAccepted(false);
        setLegalAcceptedAt(null);
    }, [
        termsRead,
        privacyRead,
        legalAccepted,
        legalAcceptedAt,
        setLegalAccepted,
        setLegalAcceptedAt,
    ]);

    const isSlotAvailable = (dateKey: string, hour: number, minutes: number) => {
        const startMin = hour * 60 + minutes;
        const endMin = startMin + estimatedMinutes;

        if (endMin > WORKING_HOURS_END * 60) return false;

        for (const b of existingBookings) {
            if (b.scheduled_date !== dateKey) continue;

            const [bh, bm] = b.scheduled_time.split(":").map(Number);
            const bStartMin = (bh || 0) * 60 + (bm || 0);
            const bEndMin = bStartMin + Math.round((Number(b.estimated_hours) || 0) * 60);

            if (startMin < bEndMin && endMin > bStartMin) return false;
        }

        return true;
    };

    const hasSlots = (dateKey: string) =>
        TIME_SLOTS.some((s) => isSlotAvailable(dateKey, s.hour, s.minutes));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getEndTime = () => {
        if (!selectedTime) return "";
        const slot = TIME_SLOTS.find((s) => s.id === selectedTime);
        if (!slot) return "";
        const endMin = slot.hour * 60 + slot.minutes + estimatedMinutes;
        const endH = Math.floor(endMin / 60);
        const endM = endMin % 60;
        return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    };

    const monthLabel = currentMonth.toLocaleString(locale, {month: "long"});
    const weekdays = t.raw("calendar.weekdays") as unknown as string[];

    const DISABLED = "opacity-35 cursor-not-allowed";

    const SELECTABLE_BTN_BASE = [
        "appearance-none",
        "border-0",
        "rounded-2xl text-sm font-medium transition-all",
        "focus:outline-none focus-visible:ring-3 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
        "[-webkit-tap-highlight-color:transparent]",
        "active:scale-[0.99]",
    ].join(" ");

    // ✅ same selected language as ApartmentDetails (border + ring, no fill)
    const SELECTED_CARD_CLASS = [
        "!ring-2 !ring-inset !ring-black/14 dark:!ring-white/18 !ring-offset-0",
        "text-[var(--text)]",
    ].join(" ");

    const MODAL_PRIMARY_BTN = [
        "bg-white/60 dark:bg-[var(--card)]/60 backdrop-blur",
        "ring-2 ring-black/10 dark:ring-white/12",
        "text-[var(--text)]",
    ].join(" ");

    const INPUT = [
        "w-full rounded-2xl border backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
        "bg-white/70 dark:bg-[var(--card)]/70 text-[var(--text)]",
        "placeholder:text-[var(--muted)]/70",
        "focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15",
        "focus:border-black/20 dark:focus:border-white/20",
        "border-black/10 dark:border-white/10",
    ].join(" ");

    const TEXTAREA = [
        "w-full rounded-2xl border backdrop-blur px-4 py-3.5 text-[15px] outline-none transition",
        "bg-white/70 dark:bg-[var(--card)]/70 text-[var(--text)]",
        "placeholder:text-[var(--muted)]/70",
        "focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15",
        "focus:border-black/20 dark:focus:border-white/20",
        "border-black/10 dark:border-white/10",
        "resize-y min-h-[110px]",
    ].join(" ");

    const ICON_BTN = [
        CARD_FRAME_BASE,
        CARD_FRAME_INTERACTIVE,
        "p-2 rounded-full",
        "hover:bg-[var(--card)]/60",
    ].join(" ");

    const CONSENT_CHIP = [
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        "border border-black/12 dark:border-white/16",
    ].join(" ");

    const canToggleLegalAccepted = termsRead && privacyRead;
    const activeDocTitle =
        legalOpenDoc === "terms" ? t("terms.termsTitle") : t("terms.privacyTitle");

    const handleLegalScroll = () => {
        const el = legalScrollRef.current;
        if (!el || legalScrolledToEnd) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
            setLegalScrolledToEnd(true);
        }
    };

    const markCurrentDocRead = () => {
        if (!legalOpenDoc || !legalScrolledToEnd) return;
        if (legalOpenDoc === "terms") setTermsRead(true);
        if (legalOpenDoc === "privacy") setPrivacyRead(true);
        setLegalOpenDoc(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                {formData.firstName?.trim() ? (
                    <div className="text-md text-[var(--muted)] mb-2">
                        {t("hiName", {name: formData.firstName.trim()})}
                    </div>
                ) : null}

                <h1 className="text-3xl font-semibold mb-3 text-[var(--text)]">{t("title")}</h1>
                <p className="text-[var(--muted)]">{t("subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.firstName")}</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({firstName: e.target.value})}
                        className={INPUT}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.lastName")}</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({lastName: e.target.value})}
                        className={INPUT}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.email")}</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({email: e.target.value})}
                    className={INPUT}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.phone")}</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({phone: e.target.value})}
                    className={INPUT}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.address")}</label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({address: e.target.value})}
                    placeholder={t("form.addressPlaceholder")}
                    className={INPUT}
                />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.postalCode")}</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formData.postalCode ?? ""}
                        onChange={(e) => setFormData({postalCode: e.target.value.replace(/\D/g, "").slice(0, 5)})}
                        placeholder="70173"
                        className={INPUT}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.city")}</label>
                    <input
                        type="text"
                        value={formData.city ?? ""}
                        onChange={(e) => setFormData({city: e.target.value})}
                        placeholder="Stuttgart"
                        className={INPUT}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("form.country")}</label>
                    <input
                        type="text"
                        value={formData.country ?? ""}
                        onChange={(e) => setFormData({country: e.target.value})}
                        placeholder="Germany"
                        className={INPUT}
                    />
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">{t("calendar.title")}</h3>
                <p className="text-sm text-[var(--muted)] mb-5">
                    {t("calendar.subtitle", {
                        hours: String(Math.max(1, Math.ceil(estimatedMinutes / 60))),
                        end: String(WORKING_HOURS_END),
                    })}
                </p>

                <div className={[CARD_FRAME_BASE, "rounded-3xl p-6"].join(" ")}>
                    <div className="flex justify-between items-center mb-6">
                        <button type="button" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                                className={ICON_BTN} aria-label={t("calendar.prev")}>
                            <ChevronLeft className="w-5 h-5 text-[var(--muted)]"/>
                        </button>

                        <div className="text-lg text-[var(--text)]">
                            <span className="font-bold">{monthLabel}</span>{" "}
                            <span className="text-[var(--muted)]">{year}</span>
                        </div>

                        <button type="button" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                                className={ICON_BTN} aria-label={t("calendar.next")}>
                            <ChevronRight className="w-5 h-5 text-[var(--muted)]"/>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekdays.map((d) => (
                            <div key={d} className="text-center text-xs font-semibold py-2 text-[var(--muted)]">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({length: firstDay}).map((_, i) => (
                            <div key={`e${i}`}/>
                        ))}

                        {Array.from({length: daysInMonth}).map((_, i) => {
                            const day = i + 1;
                            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const date = new Date(year, month, day);

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const isPast = date < today;
                            const isSunday = date.getDay() === 0;
                            const isHoliday = HOLIDAYS.has(dateKey);
                            const available = hasSlots(dateKey);

                            const isSelected = selectedDate === dateKey;
                            const disabled = isPast || isSunday || isHoliday || !available;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        setSelectedDate(dateKey);
                                        setSelectedTime(null);
                                    }}
                                    className={[
                                        "aspect-square",
                                        SELECTABLE_BTN_BASE,
                                        isSelected
                                            ? SELECTED_CARD_CLASS
                                            : disabled
                                                ? `${DISABLED} text-[var(--muted)] bg-[var(--card)]/40`
                                                : "text-[var(--text)] hover:bg-[var(--card)]/60",
                                    ].join(" ")}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedDate && (
                <div className="mb-8 animate-fadeIn">
                    <h3 className="text-base font-semibold mb-2 text-[var(--text)]">
                        {t("slots.title", {
                            date: new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            }),
                        })}
                    </h3>

                    <p className="text-sm text-[var(--muted)] mb-4">{t("slots.subtitle", {end: String(WORKING_HOURS_END)})}</p>

                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                            const available = isSlotAvailable(selectedDate, slot.hour, slot.minutes);
                            const isSelected = selectedTime === slot.id;

                            return (
                                <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => available && setSelectedTime(isSelected ? null : slot.id)}
                                    disabled={!available}
                                    className={[
                                        "py-2.5",
                                        SELECTABLE_BTN_BASE,
                                        isSelected
                                            ? SELECTED_CARD_CLASS
                                            : available
                                                ? "text-[var(--text)] hover:bg-[var(--card)]/60"
                                                : `${DISABLED} bg-[var(--card)]/40 text-[var(--muted)]`,
                                    ].join(" ")}
                                >
                                    {slot.label}
                                </button>
                            );
                        })}
                    </div>

                    {selectedTime && (
                        <p className="mt-4 text-sm font-medium text-[var(--text)]">
                            ✓ {t("slots.scheduled", {start: selectedTime, end: getEndTime()})}
                        </p>
                    )}
                </div>
            )}

            <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-[var(--text)]">{t("notes.label")}</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({notes: e.target.value})}
                    placeholder={t("notes.placeholder")}
                    className={TEXTAREA}
                />
            </div>

            <div className={[CARD_FRAME_BASE, "rounded-3xl p-4"].join(" ")}>
                <label className="flex items-start gap-3 cursor-pointer">
          <span className="relative mt-1">
            <input
                type="checkbox"
                checked={legalAccepted}
                disabled={!canToggleLegalAccepted}
                onChange={(e) => {
                    if (!canToggleLegalAccepted) return;
                    const next = e.target.checked;
                    setLegalAccepted(next);
                    setLegalAcceptedAt(next ? new Date().toISOString() : null);
                }}
                className="sr-only"
            />
            <span
                className={[
                    "grid place-items-center w-5 h-5 rounded-full border transition",
                    legalAccepted
                        ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-black/10 dark:text-gray-900"
                        : canToggleLegalAccepted
                            ? "bg-white border-black/15 text-transparent dark:bg-[var(--card)]/70 dark:border-white/20 dark:text-transparent"
                            : "bg-black/[0.04] border-black/10 text-transparent dark:bg-white/[0.04] dark:border-white/12 dark:text-transparent",
                ].join(" ")}
                aria-hidden="true"
            >
              {legalAccepted ? <CheckIcon/> : null}
            </span>
          </span>

                    <div className="text-sm text-[var(--text)] leading-snug">
                        {t("terms.prefix")}{" "}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLegalOpenDoc("terms");
                            }}
                            className="underline underline-offset-4 hover:opacity-80"
                        >
                            {t("terms.termsLink")}
                        </button>
                        {" "}{t("terms.and")}{" "}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLegalOpenDoc("privacy");
                            }}
                            className="underline underline-offset-4 hover:opacity-80"
                        >
                            {t("terms.privacyLink")}
                        </button>
                        .
                    </div>
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                    <span
                        className={[
                            CONSENT_CHIP,
                            termsRead ? "bg-black/8 text-[var(--text)] dark:bg-white/12" : "bg-transparent text-[var(--muted)]",
                        ].join(" ")}
                    >
                        {termsRead ? t("terms.statusTermsRead") : t("terms.statusTermsUnread")}
                    </span>
                    <span
                        className={[
                            CONSENT_CHIP,
                            privacyRead ? "bg-black/8 text-[var(--text)] dark:bg-white/12" : "bg-transparent text-[var(--muted)]",
                        ].join(" ")}
                    >
                        {privacyRead ? t("terms.statusPrivacyRead") : t("terms.statusPrivacyUnread")}
                    </span>
                    <span
                        className={[
                            CONSENT_CHIP,
                            legalAccepted ? "bg-black/8 text-[var(--text)] dark:bg-white/12" : "bg-transparent text-[var(--muted)]",
                        ].join(" ")}
                    >
                        {legalAccepted ? t("terms.statusConsentAccepted") : t("terms.statusConsentPending")}
                    </span>
                </div>

                <div className="mt-2 text-xs text-[var(--muted)]">
                    {!canToggleLegalAccepted
                        ? t("terms.readBothHint")
                        : legalAcceptedAt
                            ? t("terms.acceptedAt", {date: new Date(legalAcceptedAt).toLocaleString(locale)})
                            : t("terms.toggleHint")}
                </div>
            </div>

            {legalOpenDoc && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center px-6"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={() => setLegalOpenDoc(null)}
                >
                    <div className="absolute inset-0 bg-black/58 backdrop-blur-md"/>

                    <div
                        className={[CARD_FRAME_BASE, "relative w-full max-w-2xl rounded-3xl p-5 sm:p-6"].join(" ")}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="text-lg font-semibold text-[var(--text)]">{activeDocTitle}</div>
                            <button
                                type="button"
                                onClick={() => setLegalOpenDoc(null)}
                                className={ICON_BTN}
                                aria-label={t("terms.close")}
                            >
                                <X className="w-5 h-5 text-[var(--muted)]"/>
                            </button>
                        </div>

                        <div className="mb-2 text-xs text-[var(--muted)]">
                            {legalScrolledToEnd ? t("terms.scrollDone") : t("terms.scrollHint")}
                        </div>

                        <div
                            ref={legalScrollRef}
                            onScroll={handleLegalScroll}
                            className={[
                                "max-h-[58vh] overflow-y-auto pr-2",
                                "rounded-2xl border border-black/10 dark:border-white/12",
                                "bg-white/70 dark:bg-[var(--card)]/60",
                                "p-4 sm:p-5 no-scrollbar",
                            ].join(" ")}
                        >
                            {legalLoading ? (
                                <p className="text-sm text-[var(--muted)]">{t("terms.loading")}</p>
                            ) : legalLoadError ? (
                                <p className="text-sm text-red-600 dark:text-red-300">{t("terms.loadError")}</p>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        h1: (props) => (
                                            <h1 className="mb-3 text-xl sm:text-2xl font-semibold leading-tight">
                                                {props.children}
                                            </h1>
                                        ),
                                        h2: (props) => (
                                            <h2 className="mt-6 mb-2 text-base sm:text-lg font-semibold leading-tight">
                                                {props.children}
                                            </h2>
                                        ),
                                        p: (props) => (
                                            <p className="text-sm sm:text-[15px] leading-relaxed text-[var(--text)]">
                                                {props.children}
                                            </p>
                                        ),
                                        ul: (props) => <ul className="my-3 list-disc pl-5 space-y-1">{props.children}</ul>,
                                        ol: (props) => <ol className="my-3 list-decimal pl-5 space-y-1">{props.children}</ol>,
                                        li: (props) => (
                                            <li className="text-sm sm:text-[15px] leading-relaxed text-[var(--text)]">
                                                {props.children}
                                            </li>
                                        ),
                                        a: (props) => (
                                            <a className="underline underline-offset-2 hover:opacity-80" {...props} />
                                        ),
                                        strong: (props) => (
                                            <strong className="font-semibold text-black/90 dark:text-white/90">
                                                {props.children}
                                            </strong>
                                        ),
                                    }}
                                >
                                    {legalMarkdown}
                                </ReactMarkdown>
                            )}
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setLegalOpenDoc(null)}
                                className={[
                                    "px-5 py-2.5 rounded-full font-medium transition",
                                    "border border-black/15 dark:border-white/15",
                                    "text-[var(--text)]",
                                    "hover:bg-[var(--card)]/60",
                                ].join(" ")}
                            >
                                {t("terms.close")}
                            </button>

                            <button
                                type="button"
                                disabled={legalLoading || legalLoadError || !legalScrolledToEnd}
                                onClick={markCurrentDocRead}
                                className={[
                                    "px-5 py-2.5 rounded-full font-semibold transition",
                                    MODAL_PRIMARY_BTN,
                                    "disabled:opacity-45 disabled:cursor-not-allowed",
                                ].join(" ")}
                            >
                                {t("terms.markRead")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
