"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useBookingStore } from "@/lib/booking/store";
import { getExistingBookings } from "@/lib/booking/actions";
import {
    TIME_SLOTS,
    formatDateKey,
    isHoliday,
    addHoursToTime,
    type TimeSlotId,
} from "@/lib/booking/config";

interface ContactScheduleProps {
    estimatedHours: number;
}

interface Booking {
    scheduled_date: string;
    scheduled_time: string; // "HH:mm"
    estimated_hours: number;
}

export default function ContactSchedule({ estimatedHours }: ContactScheduleProps) {
    const {
        formData,
        setFormData,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        postcode,
    } = useBookingStore();

    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

    // если в форме postalCode пустой — подставляем проверенный postcode из шага 0
    const effectivePostalCode = useMemo(() => {
        const v = (formData.postalCode ?? "").trim();
        return v.length ? v : (postcode ?? "").trim();
    }, [formData.postalCode, postcode]);

    useEffect(() => {
        const fetchBookings = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const startDate = formatDateKey(year, month, 1);
            const endDate = formatDateKey(year, month + 1, 0);

            try {
                const bookings = await getExistingBookings(startDate, endDate);
                setExistingBookings(bookings);
            } catch (e) {
                console.error("Error fetching bookings:", e);
                setExistingBookings([]);
            }
        };

        void fetchBookings();
    }, [currentMonth]);

    function getDaysInMonth(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
    }

    function isDateInPast(year: number, month: number, day: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(year, month, day) < today;
    }

    function isTimeSlotAvailable(dateKey: string, slotHour: number) {
        const duration = Math.ceil(estimatedHours);
        const endHour = slotHour + duration;

        if (endHour > 20) return false;

        for (const booking of existingBookings) {
            if (booking.scheduled_date !== dateKey) continue;

            const bookingStart = parseInt(booking.scheduled_time.split(":")[0] ?? "0", 10);
            const bookingEnd = bookingStart + Math.ceil(booking.estimated_hours);

            if (slotHour < bookingEnd && endHour > bookingStart) return false;
        }

        return true;
    }

    function hasAvailableSlots(dateKey: string) {
        return TIME_SLOTS.some((slot) => isTimeSlotAvailable(dateKey, slot.hour));
    }

    const prevMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const renderCalendar = () => {
        const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const cells: ReactElement[] = [];

        for (let i = 0; i < startingDay; i++) {
            cells.push(<div key={`empty-${i}`} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = formatDateKey(year, month, day);
            const isPast = isDateInPast(year, month, day);
            const isSun = new Date(year, month, day).getDay() === 0;
            const isHol = isHoliday(dateKey);

            const hasSlots = hasAvailableSlots(dateKey);
            const isSelected = selectedDate === dateKey;

            const isDisabled = isPast || isSun || isHol;
            const isFullyBooked = !isDisabled && !hasSlots;

            const hasBookings = existingBookings.some((b) => b.scheduled_date === dateKey);

            cells.push(
                <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                        if (isDisabled || isFullyBooked) return;
                        setSelectedDate(isSelected ? null : dateKey);
                    }}
                    disabled={isDisabled || isFullyBooked}
                    className={`
            aspect-square rounded-xl text-base font-medium transition-all relative flex flex-col items-center justify-center
            ${
                        isSelected
                            ? "bg-gray-900 text-white"
                            : isFullyBooked
                                ? "bg-slate-600 text-white cursor-not-allowed"
                                : isDisabled
                                    ? "text-gray-300 cursor-default"
                                    : "bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                    }
          `}
                >
                    {day}
                    {hasBookings && !isFullyBooked && !isDisabled && (
                        <span
                            className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-white" : "bg-gray-900"
                            }`}
                        />
                    )}
                </button>
            );
        }

        return cells;
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3">Your Details</h1>
                <p className="text-gray-500">Tell us where and when to bring the sparkle</p>
            </div>

            {/* Contact form */}
            <div className="grid gap-5 mb-10">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ firstName: e.target.value })}
                            placeholder="John"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ lastName: e.target.value })}
                            placeholder="Doe"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ phone: e.target.value })}
                            placeholder="+49 123 456 7890"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ address: e.target.value })}
                        placeholder="Street name and number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ city: e.target.value })}
                            placeholder="Stuttgart"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                        <input
                            type="text"
                            value={effectivePostalCode}
                            onChange={(e) => setFormData({ postalCode: e.target.value })}
                            placeholder="70173"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Select Date & Time *</h3>
                <p className="text-sm text-gray-500 mb-5">
                    Your cleaning will take approximately <strong>{Math.ceil(estimatedHours)} hours</strong>. Unavailable slots are blocked.
                </p>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <button type="button" onClick={prevMonth} className="p-2 text-xl text-gray-500 hover:text-gray-900">
                            ‹
                        </button>

                        <div className="text-lg">
                            <span className="font-bold">{currentMonth.toLocaleString("en", { month: "long" })}</span>{" "}
                            <span className="text-gray-400">{currentMonth.getFullYear()}</span>
                        </div>

                        <button type="button" onClick={nextMonth} className="p-2 text-xl text-gray-500 hover:text-gray-900">
                            ›
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

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
                <div className="mb-8 animate-fadeIn">
                    <h3 className="text-base font-semibold mb-4">
                        Available times for{" "}
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </h3>

                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                            const isAvailable = isTimeSlotAvailable(selectedDate, slot.hour);
                            const isSelected = selectedTime === slot.id;

                            return (
                                <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => isAvailable && setSelectedTime(isSelected ? null : (slot.id as TimeSlotId))}
                                    disabled={!isAvailable}
                                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                                        isSelected
                                            ? "bg-gray-900 text-white"
                                            : isAvailable
                                                ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    {slot.label}
                                </button>
                            );
                        })}
                    </div>

                    {selectedTime && (
                        <p className="mt-4 text-sm text-green-600 font-medium">
                            ✓ Cleaning scheduled: {selectedTime} – {addHoursToTime(selectedTime, estimatedHours)}
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
                    placeholder="Access instructions, parking info, or any special requests..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y min-h-[100px]"
                />
            </div>
        </div>
    );
}