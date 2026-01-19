"use client";

import { useEffect, useMemo, useState } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { TIME_SLOTS, HOLIDAYS, getEstimatedHours, EXTRAS, WORKING_HOURS_END } from "@/lib/booking/config";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ExistingBookingRow = {
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // "HH:mm"
    estimated_hours: number;
};

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

    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [existingBookings, setExistingBookings] = useState<ExistingBookingRow[]>([]);

    // ---------- hours -> minutes (точно) ----------
    const estimatedMinutes = useMemo(() => {
        const baseHours = getEstimatedHours(selectedService || "", apartmentSize || "");
        const extrasHours = Object.entries(extras).reduce((sum, [id, qty]) => {
            const e = EXTRAS.find((x) => x.id === id);
            return sum + (e ? e.hours * qty : 0);
        }, 0);

        // округляем до минут, чтобы финиш был корректный
        return Math.max(0, Math.round((baseHours + extrasHours) * 60));
    }, [selectedService, apartmentSize, extras]);

    // ---------- fetch existing bookings via API ----------
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startDate: start, endDate: end }),
                    signal: controller.signal,
                });

                const json = (await res.json()) as ExistingBookingRow[];
                setExistingBookings(Array.isArray(json) ? json : []);
            } catch {
                // если отмена / ошибка — просто пусто
                setExistingBookings([]);
            }
        };

        run();
        return () => controller.abort();
    }, [currentMonth]);

    // ---------- slot availability (в минутах, финиш <= 18:00) ----------
    const isSlotAvailable = (dateKey: string, hour: number, minutes: number) => {
        const startMin = hour * 60 + minutes;
        const endMin = startMin + estimatedMinutes;

        // must finish by 18:00 (WORKING_HOURS_END = 18)
        if (endMin > WORKING_HOURS_END * 60) return false;

        for (const b of existingBookings) {
            if (b.scheduled_date !== dateKey) continue;

            const [bh, bm] = b.scheduled_time.split(":").map(Number);
            const bStartMin = (bh || 0) * 60 + (bm || 0);
            const bEndMin = bStartMin + Math.round((Number(b.estimated_hours) || 0) * 60);

            // overlap check
            if (startMin < bEndMin && endMin > bStartMin) return false;
        }

        return true;
    };

    const hasSlots = (dateKey: string) => TIME_SLOTS.some((s) => isSlotAvailable(dateKey, s.hour, s.minutes));

    // ---------- calendar calc ----------
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
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
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
                    ~{Math.max(1, Math.ceil(estimatedMinutes / 60))}h cleaning. Must finish by 18:00.
                </p>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="text-lg">
                            <span className="font-bold">{currentMonth.toLocaleString("en", { month: "long" })}</span>{" "}
                            <span className="text-gray-400">{year}</span>
                        </div>

                        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                            <div
                                key={d}
                                className={`text-center text-xs font-semibold py-2 ${d === "SUN" ? "text-gray-300" : "text-gray-500"}`}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`e${i}`} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const date = new Date(year, month, day);

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const isPast = date < today;
                            const isSunday = date.getDay() === 0;
                            const isHoliday = HOLIDAYS.includes(dateKey);
                            const available = hasSlots(dateKey);
                            const isSelected = selectedDate === dateKey;

                            const disabled = isPast || isSunday || isHoliday || !available;

                            return (
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
                        })}
                    </div>
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="mb-8 animate-fadeIn">
                    <h3 className="text-base font-semibold mb-2">
                        Available times for{" "}
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
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