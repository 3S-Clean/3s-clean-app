import { Suspense } from "react";
import BookingClient from "@/components/booking/BookingClient"

export default function BookingPage() {
    return (
        <Suspense fallback={null}>
            <BookingClient />
        </Suspense>
    );
}