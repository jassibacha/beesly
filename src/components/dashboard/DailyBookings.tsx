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

  const formatBookingTime = (isoTime: string, end?: boolean) => {
    if (end) {
      return DateTime.fromISO(isoTime, { zone: locationSettings.timeZone })
        .setZone("America/Los_Angeles") // Adjust the timezone as needed
        .toFormat("h:mm a MM/dd/yyyy"); // Format the time as "9:00 PM", "10:00 PM", etc.
    }
    // Parse the ISO string to a Luxon DateTime object, assuming the times are in UTC and need to be displayed in a specific timezone
    return DateTime.fromISO(isoTime, { zone: locationSettings.timeZone })
      .setZone("America/Los_Angeles") // Adjust the timezone as needed
      .toFormat("h:mm a"); // Format the time as "9:00 PM", "10:00 PM", etc.
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

    return (
      <div className="flex flex-col">
        <ul>
          {bookingsData?.bookings?.map((booking) => (
            <li key={booking.id}>
              {booking.customerName}: {formatBookingTime(booking.startTime!)} -{" "}
              {formatBookingTime(booking.endTime!, true)}
            </li>
          ))}
        </ul>
      </div>
    );
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
