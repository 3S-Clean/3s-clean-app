// components/booking/ContactSchedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBookingStore } from "@/lib/booking/store";
import { TIME_SLOTS, isTimeSlotAllowed, calculateHours, type TimeSlotId } from "@/lib/booking/config";
import { createOrder, getExistingBookings } from "@/lib/booking/actions";

type Existing = { scheduled_date: string; scheduled_time: string; estimated_hours: number };

function overlaps(aStart: string, aHours: number, bStart: string, bHours: number): boolean {
    const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };
    const a0 = toMin(aStart);
    const a1 = a0 + Math.round(aHours * 60);
    const b0 = toMin(bStart);
    const b1 = b0 + Math.round(bHours * 60);
    return a0 < b1 && b0 < a1;
}

export default function ContactSchedule() {
    const router = useRouter();

    const {
        selectedService,
        apartmentSize,
        peopleCount,
        hasPets,
        extras,
        formData,
        selectedDate,
        selectedTime,
        setSelectedDate,
        setSelectedTime,
        setPendingToken,
    } = useBookingStore();

    const estimatedHours = useMemo(() => {
        if (!selectedService || !apartmentSize) return 0;
        return calculateHours(selectedService, apartmentSize, extras);
    }, [selectedService, apartmentSize, extras]);

    const [busy, setBusy] = useState<Existing[]>([]);
    const [loading, setLoading] = useState(false);

    // пример: грузим брони на неделю вокруг выбранной даты (можешь сделать как у тебя)
    useEffect(() => {
        if (!selectedDate) return;

        const start = selectedDate; // упрощённо
        const end = selectedDate;   // на один день

        const run = async () => {
            const data = await getExistingBookings(start, end);
            setBusy(data);
        };

        void run();
    }, [selectedDate]);

    const availableSlots = useMemo(() => {
        if (!selectedDate) return TIME_SLOTS;

        return TIME_SLOTS.filter((slot) => {
            // 1) hard end by 18:00
            if (!isTimeSlotAllowed(slot.id, estimatedHours)) return false;

            // 2) no overlaps with busy bookings (pending/confirmed)
            for (const b of busy) {
                if (b.scheduled_date !== selectedDate) continue;
                if (overlaps(slot.id, estimatedHours, b.scheduled_time, b.estimated_hours)) return false;
            }
            return true;
        });
    }, [selectedDate, busy, estimatedHours]);

    async function onSubmit() {
        if (!selectedService || !apartmentSize || !peopleCount) return;
        if (!selectedDate || !selectedTime) return;

        setLoading(true);
        try {
            const res = await createOrder({
                serviceType: selectedService,
                apartmentSize,
                peopleCount,
                hasPets,
                hasKids: false,
                hasAllergies: false,
                allergyNotes: "",
                extras,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                customerFirstName: formData.firstName,
                customerLastName: formData.lastName,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                customerCity: formData.city,
                customerPostalCode: formData.postalCode,
                customerNotes: formData.notes,
            });

            setPendingToken(res.pendingToken);
            router.push(`/booking/success?token=${encodeURIComponent(res.pendingToken)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full">
            {/* Date picker у тебя уже есть — главное: при смене даты сбрасывать время */}
            <div className="mt-6">
                <label className="text-sm font-medium text-black">Date</label>
                <input
                    type="date"
                    value={selectedDate ?? ""}
                    onChange={(e) => setSelectedDate(e.target.value || null)}
                    className="mt-2 w-full h-12 rounded-2xl border border-black/10 bg-white/60 px-4 text-sm
                     focus:outline-none focus:ring-2 focus:ring-black/10"
                />
            </div>

            <div className="mt-6">
                <label className="text-sm font-medium text-black">Time</label>

                <div className="mt-2 grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                        const active = selectedTime === slot.id;
                        return (
                            <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedTime(slot.id as TimeSlotId)}
                                className={[
                                    "h-10 rounded-xl text-sm font-medium border transition",
                                    active ? "bg-black text-white border-black" : "bg-white/60 text-black border-black/10 hover:border-black/30",
                                ].join(" ")}
                            >
                                {slot.label}
                            </button>
                        );
                    })}
                </div>

                {/* подсказка почему слотов нет */}
                {selectedDate && availableSlots.length === 0 && (
                    <p className="mt-3 text-xs text-black/50">
                        No available time slots. The cleaning must finish by 18:00 and avoid overlaps.
                    </p>
                )}
            </div>

            <button
                onClick={onSubmit}
                disabled={loading || !selectedDate || !selectedTime}
                className={[
                    "mt-8 w-full h-14 rounded-full font-medium transition",
                    loading || !selectedDate || !selectedTime ? "bg-black/15 text-white/70" : "bg-black text-white",
                ].join(" ")}
            >
                {loading ? "Creating..." : "Continue"}
            </button>
        </div>
    );
}