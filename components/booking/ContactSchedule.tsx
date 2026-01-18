"use client";

import { useEffect, useMemo, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import {
    TIME_SLOTS,
    HOLIDAYS,
    calculateHours,
    EXTRAS,
    WORKING_HOURS_END,
    type ServiceId,
    type ApartmentSizeId,
} from "@/lib/booking/config";
import { getExistingBookings } from "@/lib/booking/actions";

type BookingRow = {
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // "HH:mm"
    estimated_hours: number; // number
};

function toISODate(d: Date) {
    return d.toISOString().split("T")[0];
}

function toMinutesFromHHMM(t: string) {
    const [hStr, mStr = "0"] = (t || "00:00").split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

// округление в 15 минут (чтобы UI совпадал с слотами)
function roundTo15Min(minutes: number) {
    return Math.ceil(minutes / 15) * 15;
}

function formatDurationFromMinutes(totalMinutes: number) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h ${String(m).padStart(2, "0")}min`;
}

export default function ContactSchedule() {
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
    } = useBookingStore();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [existingBookings, setExistingBookings] = useState<BookingRow[]>([]);

    // ✅ base hours: только матрица, без extras
    const baseHours = useMemo(() => {
        if (!selectedService || !apartmentSize) return 0;
        return calculateHours(selectedService as ServiceId, apartmentSize as ApartmentSizeId, {});
    }, [selectedService, apartmentSize]);

    // ✅ extras hours: сумма по EXTRAS
    const extrasHours = useMemo(() => {
        return Object.entries(extras || {}).reduce((sum, [id, qty]) => {
            const q = Number(qty) || 0;
            if (q <= 0) return sum;
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.hours * q : 0);
        }, 0);
    }, [extras]);

    const estimatedHours = baseHours + extrasHours;

    // ✅ duration in minutes (округляем до 15 минут — и для UI, и для расчёта)
    const durationMin = useMemo(() => roundTo15Min(Math.round(estimatedHours * 60)), [estimatedHours]);
    const durationLabel = useMemo(() => formatDurationFromMinutes(durationMin), [durationMin]);

    useEffect(() => {
        const fetchBookings = async () => {
            const start = toISODate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
            const end = toISODate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
            const rows = await getExistingBookings(start, end);
            setExistingBookings(Array.isArray(rows) ? (rows as BookingRow[]) : []);
        };

        void fetchBookings();
    }, [currentMonth]);

    const isSlotAvailable = (dateKey: string, hour: number, minutes: number) => {
        const startMin = hour * 60 + minutes;
        const endMin = startMin + durationMin;

        if (endMin > WORKING_HOURS_END * 60) return false;

        for (const b of existingBookings) {
            if (b.scheduled_date !== dateKey) continue;

            const bStartMin = toMinutesFromHHMM(b.scheduled_time);
            const bDurMin = roundTo15Min(Math.round((Number(b.estimated_hours) || 0) * 60));
            const bEndMin = bStartMin + bDurMin;

            if (startMin < bEndMin && endMin > bStartMin) return false;
        }

        return true;
    };

    const hasSlots = (dateKey: string) =>
        TIME_SLOTS.some((s) => isSlotAvailable(dateKey, s.hour, s.minutes));

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days: React.ReactNode[] = [];

        for (let i = 0; i < firstDay; i++) days.push(<div key={`e${i}`} />);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const date = new Date(year, month, day);
            const isPast = date < today;
            const isSunday = date.getDay() === 0;
            const isHoliday = HOLIDAYS.includes(dateKey);
            const available = hasSlots(dateKey);
            const isSelected = selectedDate === dateKey;
            const disabled = isPast || isSunday || isHoliday || !available;

            days.push(
                <button
                    key={day}
                    disabled={disabled}
                    onClick={() => {
                        setSelectedDate(dateKey);
                        setSelectedTime(null);
                    }}
                    className={`aspect-square rounded-xl text-sm font-medium transition-all
            ${isSelected ? "bg-gray-900 text-white" : ""}
            ${disabled && !isSelected ? "text-gray-300 cursor-not-allowed" : ""}
            ${!disabled && !isSelected ? "hover:bg-gray-100 text-gray-700" : ""}`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const getEndTime = () => {
        if (!selectedTime) return "";
        const slot = TIME_SLOTS.find((s) => s.id === selectedTime);
        if (!slot) return "";

        const endMin = slot.hour * 60 + slot.minutes + durationMin;
        const endH = Math.floor(endMin / 60);
        const endM = endMin % 60;

        return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Contact & Schedule</h1>
                <p className="text-gray-500">Enter your details and pick a time</p>
            </div>

            {/* Contact Form */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Address *</label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ address: e.target.value })}
                    placeholder="Street and house number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            {/* Calendar */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Select Date & Time *</h3>
                <p className="text-sm text-gray-500 mb-5">
                    ~{durationLabel} cleaning. Must finish by 18:00.
                </p>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-2 text-xl text-gray-500 hover:text-gray-900"
                        >
                            ‹
                        </button>
                        <div className="text-lg">
                            <span className="font-bold">{currentMonth.toLocaleString("en", { month: "long" })}</span>{" "}
                            <span className="text-gray-400">{currentMonth.getFullYear()}</span>
                        </div>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-2 text-xl text-gray-500 hover:text-gray-900"
                        >
                            ›
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                            <div key={d} className={`text-center text-xs font-semibold py-2 ${d === "SUN" ? "text-gray-300" : "text-gray-500"}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="mb-8 animate-fadeIn">
                    <h3 className="text-base font-semibold mb-2">
                        Available times for{" "}
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Cleaning must finish by 18:00</p>

                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                            const available = isSlotAvailable(selectedDate, slot.hour, slot.minutes);
                            const isSelected = selectedTime === slot.id;

                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => available && setSelectedTime(isSelected ? null : slot.id)}
                                    disabled={!available}
                                    className={`py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isSelected ? "bg-gray-900 text-white" : available ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
                                >
                                    {slot.label}
                                </button>
                            );
                        })}
                    </div>

                    {selectedTime && (
                        <p className="mt-4 text-sm text-gray-900 font-medium">
                            ✓ Cleaning scheduled: {selectedTime} - {getEndTime()}
                        </p>
                    )}
                </div>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ notes: e.target.value })}
                    placeholder="Access instructions, parking info..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y min-h-[100px]"
                />
            </div>
        </div>
    );
}