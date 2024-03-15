"use client";
import type { Booking, Location } from "@/server/db/types";
import React, { useState } from "react";
import { DateTime } from "luxon";
import { Calendar } from "@/components/ui/calendar";

interface LocationBookingsProps {
  locations: Location[];
  bookings: Booking[];
}

export function LocationBookings({
  locations,
  bookings,
}: LocationBookingsProps) {
  // State for selected date
  const [selectedDate, setSelectedDate] = useState<DateTime>(
    DateTime.now().startOf("day"),
  );

  // Filter bookings based on selected date
  const filteredBookings = bookings.filter((booking) =>
    DateTime.fromJSDate(booking.startTime).hasSame(selectedDate, "day"),
  );

  // Group bookings by location
  const bookingsByLocation = filteredBookings.reduce(
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
      <div className="mb-4">
        <Calendar
          mode="single"
          selected={selectedDate.toJSDate()}
          onSelect={(date) => setSelectedDate(DateTime.fromJSDate(date))}
        />
      </div>
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
          {Array.from({ length: 24 }).map((_, hour) => (
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
