//import { Booking } from "@/server/db/types";
import { BookingItem } from "./BookingItem";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: Date;
  endTime: Date;
}

interface BookingsListProps {
  bookings: Booking[];
  timezone: string;
}

export default function BookingsList({
  bookings,
  timezone,
}: BookingsListProps) {
  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} timezone={timezone} />
      ))}
    </div>
  );
}
