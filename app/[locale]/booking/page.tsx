import {Suspense} from "react";
import BookingClient from "@/features/booking/components/BookingClient"

export default function BookingPage() {
    return (
        <Suspense fallback={null}>
            <BookingClient/>
        </Suspense>
    );
}