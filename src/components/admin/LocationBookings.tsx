"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Booking, Location } from "@/server/db/types";
import React from "react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { DateTime } from "luxon";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface LocationBookingsProps {
  locations: Location[];
}

export function LocationBookings({ locations }: LocationBookingsProps) {
  const form = useForm({
    defaultValues: {
      date: DateTime.now().setZone("America/Los_Angeles").toJSDate(),
    },
  });

  const { watch } = form;

  // Watching the date field for changes
  const selectedDate = watch("date");

  // tRPC query to fetch bookings for the selected date
  const { data: bookings, isLoading } =
    api.booking.getAllBookingsByDate.useQuery(
      {
        date: selectedDate,
      },
      {
        enabled: !!selectedDate,
      },
    );

  // Group bookings by location
  const bookingsByLocation = bookings?.reduce(
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
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-[180px] pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          DateTime.fromJSDate(field.value).toFormat("DDD")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* isLoading table logic */}
      {isLoading ? (
        <div>Loading bookings...</div>
      ) : (
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
                  const locationBookings =
                    bookingsByLocation[location.id] ?? [];
                  const hourBookings = locationBookings.filter(
                    (booking) =>
                      DateTime.fromJSDate(booking.startTime).hour === hour,
                  );

                  return (
                    <td key={location.id} className="px-6 py-4">
                      {hourBookings.length > 0 ? (
                        hourBookings.map((booking, index) => (
                          <div key={index}>
                            <div>{booking.customerName}</div>
                            <div>
                              {DateTime.fromJSDate(booking.startTime).toFormat(
                                "h:mm a",
                              )}{" "}
                              -{" "}
                              {DateTime.fromJSDate(booking.endTime).toFormat(
                                "h:mm a",
                              )}{" "}
                              {DateTime.fromJSDate(booking.startTime).toFormat(
                                "z",
                              )}
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
                        ))
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
      )}
    </div>
  );
}
