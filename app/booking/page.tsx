"use client";

import PostcodeCheck from "@/components/booking/PostcodeCheck";
import ServiceSelection from "@/components/booking/ServiceSelection";
import ApartmentDetails from "@/components/booking/ApartmentDetails";
import ExtraServices from "@/components/booking/ExtraServices";
import ContactSchedule from "@/components/booking/ContactSchedule";
import { useBookingStore } from "@/lib/booking/store";

function ProgressDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => {
                // по твоим замечаниям:
                // пройденные — чёрные
                // текущая — не зелёная, серо/белая
                // будущие — серые
                const isPast = i < step;
                const isCurrent = i === step;

                const cls = isPast
                    ? "bg-black"
                    : isCurrent
                        ? "bg-white border border-black"
                        : "bg-black/20";

                const size = isCurrent ? "h-3.5 w-3.5" : "h-3 w-3";

                return <span key={i} className={`${size} rounded-full ${cls}`} />;
            })}
        </div>
    );
}

export default function BookingPage() {
    const { step } = useBookingStore();

    return (
        <main className="min-h-screen px-4 py-10 bg-[#f6f5f2]">
            <div className="mx-auto w-full max-w-2xl">
                <ProgressDots step={step} total={5} />

                <div className="mt-8">
                    {step === 0 && <PostcodeCheck />}
                    {step === 1 && <ServiceSelection />}
                    {step === 2 && <ApartmentDetails />}
                    {step === 3 && <ExtraServices />}
                    {step === 4 && <ContactSchedule />}
                </div>
            </div>
        </main>
    );
}