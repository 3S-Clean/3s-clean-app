import {Suspense} from "react";
import {BookingClient} from "@/features/booking/components";

export default function BookingPage() {
    return (
        <Suspense fallback={null}>
            <BookingClient/>
        </Suspense>
    );
}
