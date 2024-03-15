import type { Booking, Location } from "@/server/db/types";
import React from "react";
import { DateTime } from "luxon";

interface LocationBookingsProps {
  locations: Location[];
  bookings: Booking[];
}

export function LocationBookings({
  locations,
  bookings,
}: LocationBookingsProps) {
  // Determine the range of hours to display
  const startHour = 0; // Start at midnight
  const endHour = 23; // End at 11 PM
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );

  // Group bookings by location
  const bookingsByLocation = bookings.reduce(
    (acc, booking) => {
      const locationBookings = acc[booking.locationId] ?? [];
      return {
        ...acc,
        [booking.locationId]: [...locationBookings, booking],
      };
    },
    {} as Record<string, Booking[]>,
  );

  return (
    <div>
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Time</th>
            {locations.map((location) => (
              <th key={location.id} className="px-6 py-3">
                {location.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr
              key={hour}
              className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <td className="px-6 py-4">
                {DateTime.fromObject({ hour }).toFormat("h a")}
              </td>
              {locations.map((location) => {
                const locationBookings = bookingsByLocation[location.id] ?? [];
                const booking = locationBookings.find(
                  (booking) =>
                    DateTime.fromJSDate(booking.startTime).hour === hour &&
                    DateTime.fromJSDate(booking.endTime).hour >= hour,
                );

                return (
                  <td key={location.id} className="px-6 py-4">
                    {booking ? (
                      <div>
                        <div>{booking.customerName}</div>
                        <div>
                          {DateTime.fromJSDate(booking.startTime).toFormat(
                            "h:mm a",
                          )}{" "}
                          -{" "}
                          {DateTime.fromJSDate(booking.endTime).toFormat(
                            "h:mm a",
                          )}{" "}
                          {DateTime.fromJSDate(booking.startTime).toFormat("z")}
                        </div>
                        <div>
                          {booking.emailReminderSent ? (
                            <span className="mr-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-200 dark:text-green-900">
                              Reminder Sent
                            </span>
                          ) : (
                            <span className="mr-2 rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-200 dark:text-red-900">
                              Reminder Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>No Booking</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
