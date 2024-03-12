//import { Booking } from "@/server/db/types";
import { BookingItem } from "./BookingItem";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";

interface BookingsListProps {
  bookings: Booking[];
  timezone: string;
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
}

export default function BookingsList({
  bookings,
  timezone,
  location,
  locationSettings,
  resources,
}: BookingsListProps) {
  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <BookingItem
          key={booking.id}
          booking={booking}
          timezone={timezone}
          location={location}
          locationSettings={locationSettings}
          resources={resources}
        />
      ))}
    </div>
  );
}
