"use client";
import { api } from "@/trpc/react";
import { DateTime } from "luxon";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { Location, LocationSetting, Resource } from "@/server/db/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface DailyBookingProps {
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
}

interface BookingData {
  locationId: string;
  id: string;
  startTime: string | null;
  endTime: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface BookingsResponse {
  openTimeISO: string;
  closeTimeISO: string;
  bookings: BookingData[];
}

export default function DailyBookings({
  location,
  locationSettings,
  resources,
}: DailyBookingProps) {
  //const { isSignedIn, user, isLoaded } = useUser();

  const form = useForm({
    defaultValues: {
      date: DateTime.now().toJSDate(),
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting },
  } = form;

  // Watching the date field for changes
  const selectedDate = watch("date");

  // Use `useQuery` to fetch bookings. Note that we're not calling `.query` directly;
  // useQuery is the hook provided by TRPC for React.
  // Adjust the query key accordingly if your procedure expects any parameters.
  // const { data, isLoading, error } = api.booking.listBookings.useQuery();

  // tRPC query to fetch time slots (available and unavailable)
  const {
    data: bookingsData,
    isLoading: bookingsIsLoading,
    error: bookingsError,
  } = api.booking.listBookingsByDate.useQuery<BookingsResponse>(
    {
      locationId: location.id,
      date: selectedDate,
    },
    {
      enabled: !!selectedDate,
    },
  );

  // Log raw startTime and endTime
  // console.log(
  //   "Raw Booking Times:",
  //   data.bookings?.map((booking) => ({
  //     id: booking.id,
  //     startTime: booking.startTime,
  //     endTime: booking.endTime,
  //   })),
  // );

  const hours = Array.from({ length: 24 }, (_, i) => i * 60); // Generate an array of minutes [0, 60, 120, ..., 1380]
  //const hours = Array.from({ length: 24 * 4 }, (_, i) => i * 15); // Generate an array of minutes [0, 15, 30, ..., 1410, 1425]

  const slotHeight = 6; // Height of a 15-minute slot in pixels

  const BASE_SLOT_HEIGHT = 20; // Height of a 15-minute slot in pixels (1/4 of an hour)
  const HOUR_HEIGHT = BASE_SLOT_HEIGHT * 4; // Height of a full hour in pixels

  const calculateHeight = (minutes: number) => {
    return (minutes / 15) * BASE_SLOT_HEIGHT; // Calculate height based on the duration in minutes
  };

  // const formatBookingTime = (isoTime: string, end?: boolean) => {
  //   if (end) {
  //     return DateTime.fromISO(isoTime, { zone: locationSettings.timeZone })
  //       .setZone("America/Los_Angeles") // Adjust the timezone as needed
  //       .toFormat("h:mm a MM/dd/yyyy"); // Format the time as "9:00 PM", "10:00 PM", etc.
  //   }
  //   // Parse the ISO string to a Luxon DateTime object, assuming the times are in UTC and need to be displayed in a specific timezone
  //   return DateTime.fromISO(isoTime, { zone: locationSettings.timeZone })
  //     .setZone("America/Los_Angeles") // Adjust the timezone as needed
  //     .toFormat("h:mm a"); // Format the time as "9:00 PM", "10:00 PM", etc.
  // };

  // Function to calculate grid row start based on time
  const calculateGridRow = (isoTime: string) => {
    const time = DateTime.fromISO(isoTime, { zone: locationSettings.timeZone });
    return time.hour + time.minute / 60 + 1; // +1 because CSS grid rows start at 1
  };

  const calculateGridRowStart = (isoTime: string) => {
    const time = DateTime.fromISO(isoTime, { zone: locationSettings.timeZone });
    return time.hour * 4 + Math.floor(time.minute / 15) + 1; // +1 because CSS grid rows start at 1
  };

  const renderBookings = () => {
    if (bookingsIsLoading)
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin" />{" "}
          {/* Loading icon with spin animation */}
          <span>Loading time slots...</span>
        </div>
      );
    if (bookingsData?.bookings?.length === 0)
      return (
        <div className="flex flex-col justify-center justify-items-center">
          No bookings for this date.
        </div>
      ); // Display when no time slots are available

    // return (
    //   <div className="flex flex-col">
    //     <ul>
    //       {bookingsData?.bookings?.map((booking) => (
    //         <li key={booking.id}>
    //           {booking.customerName}: {formatBookingTime(booking.startTime!)} -{" "}
    //           {formatBookingTime(booking.endTime!, true)}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // );

    // return (
    //   <div className="flex w-full">
    //     <div className="flex w-16 flex-col text-sm">
    //       {hours.map((minute) => (
    //         <div
    //           key={minute}
    //           className={`h-20 border-b border-gray-200 pr-2 text-right`} // Adjust the height to span one hour
    //         >
    //           {DateTime.fromObject({ hour: minute / 60 }).toFormat("ha")}
    //         </div>
    //       ))}
    //     </div>
    //     <div className="relative flex-1">
    //       <div
    //         className="absolute inset-0 grid w-full"
    //         style={{ gridTemplateRows: `repeat(${24}, ${slotHeight * 4}px)` }} // Adjust the grid to have rows for each hour
    //       >
    //         {hours.map((minute, index) => (
    //           <div
    //             key={index}
    //             className="border-b border-gray-200" // Add a vertical border for each hour
    //             style={{
    //               gridRowStart: index + 1,
    //               gridRowEnd: index + 2,
    //             }}
    //           ></div>
    //         ))}
    //         {bookingsData?.bookings?.map((booking, index) => {
    //           const start = DateTime.fromISO(booking.startTime!);
    //           const end = DateTime.fromISO(booking.endTime!);
    //           const durationInMinutes = end.diff(start, "minutes").minutes;
    //           const height = (durationInMinutes / 60) * slotHeight * 4; // Adjust the height calculation for hourly slots

    //           return (
    //             <div
    //               key={index}
    //               className="absolute bg-blue-500 p-1 text-white"
    //               style={{
    //                 gridColumn: "1 / -1",
    //                 gridRowStart: (start.hour * 60 + start.minute) / 60 + 1, // Adjust the gridRowStart calculation for hourly slots
    //                 height: `${height}px`,
    //               }}
    //             >
    //               {booking.customerName}: {start.toFormat("h:mm a")} -{" "}
    //               {end.toFormat("h:mm a")}
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </div>
    //   </div>
    // );

    return (
      <div className="flex w-full">
        <div className="flex w-16 flex-col text-sm">
          {hours.map((minute) => (
            <div
              key={minute}
              className="border-b border-gray-200 pr-2 text-right"
              style={{ height: `${HOUR_HEIGHT}px` }} // Set the height for each hour slot
            >
              {DateTime.fromObject({ hour: minute / 60 }).toFormat("ha")}
            </div>
          ))}
        </div>
        <div className="relative flex-1">
          <div
            className="absolute inset-0 grid w-full"
            style={{ gridTemplateRows: `repeat(${24}, ${HOUR_HEIGHT}px)` }} // Set the grid rows to match the hour height
          >
            {hours.map((minute, index) => (
              <div
                key={index}
                className="border-b border-gray-200" // Add a horizontal border for each hour
                style={{
                  gridRowStart: index + 1,
                  gridRowEnd: index + 2,
                }}
              ></div>
            ))}
            {bookingsData?.bookings?.map((booking, index) => {
              const start = DateTime.fromISO(booking.startTime!);
              const end = DateTime.fromISO(booking.endTime!);
              const durationInMinutes = end.diff(start, "minutes").minutes;
              const height = calculateHeight(durationInMinutes); // Calculate the height based on the booking duration

              return (
                <div
                  key={index}
                  className="absolute bg-blue-500 p-1 text-white"
                  style={{
                    gridColumn: "1 / -1",
                    gridRowStart: (start.hour * 60 + start.minute) / 60 + 1,
                    height: `${height}px`, // Set the height of the booking
                  }}
                >
                  {booking.customerName}: {start.toFormat("h:mm a")} -{" "}
                  {end.toFormat("h:mm a")}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

    // return (
    //   <div className="flex w-full">
    //     <div className="flex w-16 flex-col text-sm">
    //       {hours.map((minute) => (
    //         <div
    //           key={minute}
    //           className={`h-${slotHeight} border-b border-gray-200 pr-2 text-right`}
    //         >
    //           {minute % 60 === 0 &&
    //             DateTime.fromObject({ hour: minute / 60 }).toFormat("ha")}
    //         </div>
    //       ))}
    //     </div>
    //     <div className="relative flex-1">
    //       <div
    //         className="absolute inset-0 grid w-full"
    //         style={{ gridTemplateRows: `repeat(${24 * 4}, ${slotHeight}px)` }}
    //       >
    //         {bookingsData?.bookings?.map((booking, index) => {
    //           const start = DateTime.fromISO(booking.startTime!);
    //           const end = DateTime.fromISO(booking.endTime!);
    //           const durationInMinutes = end.diff(start, "minutes").minutes;
    //           const height = (durationInMinutes / 15) * slotHeight;

    //           return (
    //             <div
    //               key={index}
    //               className="absolute bg-blue-500 p-1 text-white"
    //               style={{
    //                 gridColumn: "1 / -1",
    //                 gridRowStart: (start.hour * 60 + start.minute) / 15 + 1,
    //                 height: `${height}px`,
    //               }}
    //             >
    //               {booking.customerName}: {start.toFormat("h:mm a")} -{" "}
    //               {end.toFormat("h:mm a")}
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </div>
    //   </div>
    // );
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle>Daily Bookings</CardTitle>
          <CardDescription>
            View all bookings for all stations for the day.
          </CardDescription>
        </div>
        <div className="flex-0">
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    {/* <FormLabel htmlFor="date" aria-required={true}>
                  Booking Date
                </FormLabel> */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
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
                          disabled={
                            (date) =>
                              // Disabling dates based on Luxon comparisons
                              DateTime.fromJSDate(date) <
                                DateTime.now().startOf("day") ||
                              DateTime.fromJSDate(date) >
                                DateTime.now().plus({ days: 60 }) // TOOD: Change this to dynamic setting for max days
                          }
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
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex items-center justify-between space-y-2">
            {renderBookings()}
          </div>
          {/* {data.bookings?.length ? (
        <ul>
          {data.bookings.map((booking) => (
            <li key={booking.id}>
              {booking.customerName} - {formatBookingTime(booking.startTime)} to{" "}
              {formatBookingTime(booking.endTime)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )} */}
        </div>
      </CardContent>
    </Card>
  );
}
