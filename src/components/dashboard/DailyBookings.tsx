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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { EditBookingDialog } from "./bookings/EditBookingDialog";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";
import { useLocationContext } from "@/context/LocationContext";

interface DailyBookingProps {
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
}

// TODO: Eventually we can swap this to actual Booking
interface BookingData {
  locationId: string;
  id: string;
  startTime: string | null;
  endTime: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  totalCost: string | null;
  taxAmount: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  emailReminderSent: boolean;
}

interface BookingsResponse {
  openTimeISO: string;
  closeTimeISO: string;
  bookings: BookingData[]; // Eventually we can swap this to actual Booking
  isOpen: boolean;
}

// export default function DailyBookings({
//   location,
//   locationSettings,
//   resources,
// }: DailyBookingProps) {
export default function DailyBookings() {
  const { location, locationSettings, resources, isLoading } =
    useLocationContext();

  const form = useForm({
    defaultValues: {
      date: DateTime.now().setZone(location?.timezone).toJSDate(),
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

  // tRPC query to fetch time slots (available and unavailable)
  const {
    data: bookingsData,
    isLoading: bookingsIsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = api.booking.listBookingsByDate.useQuery<BookingsResponse>(
    {
      locationId: location?.id ?? "",
      date: selectedDate,
    },
    {
      enabled: !isLoading && !!selectedDate,
    },
  );

  if (!location || !locationSettings || !resources) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-10 w-10 animate-spin" />
        {/* {" "}
        <span>Loading time slots...</span> */}
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i * 60); // Generate an array of minutes [0, 60, 120, ..., 1380]

  const BASE_SLOT_HEIGHT = 20; // Height of a 15-minute slot in pixels (1/4 of an hour)
  const HOUR_HEIGHT = BASE_SLOT_HEIGHT * 4; // Height of a full hour in pixels

  const calculateHeight = (minutes: number) => {
    return (minutes / 15) * BASE_SLOT_HEIGHT; // Calculate height based on the duration in minutes
  };

  const calculateGridRowStart = (isoTime: string) => {
    const time = DateTime.fromISO(isoTime, { zone: location.timezone });
    return time.hour * 4 + Math.floor(time.minute / 15) + 1; // +1 because CSS grid rows start at 1
  };

  const openingTime = bookingsData
    ? DateTime.fromISO(bookingsData.openTimeISO, {
        zone: location.timezone,
      })
    : null;
  const offsetInPixels = openingTime
    ? ((openingTime.hour * 60 + openingTime.minute) / 15) * BASE_SLOT_HEIGHT
    : 0;

  const reducedOffsetInPixels = offsetInPixels - 100;

  const renderBookings = () => {
    if (bookingsIsLoading || isLoading)
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin" />{" "}
          <span>Loading time slots...</span>
        </div>
      );
    if (bookingsData?.isOpen === false) {
      return (
        <div className="flex flex-col justify-center justify-items-center">
          Location is closed for the day.
        </div>
      );
    }
    if (bookingsData?.bookings?.length === 0)
      return (
        <div className="flex flex-col justify-center justify-items-center">
          No bookings for this date.
        </div>
      ); // Display when no time slots are available

    return (
      <div
        className="relative flex h-full w-full overflow-hidden border-t border-gray-200 dark:border-gray-600"
        style={{
          marginTop: `-${reducedOffsetInPixels}px`,
        }}
      >
        <div className="flex w-20 flex-col text-sm">
          {hours.map((minute) => (
            <div
              key={minute}
              className="border-b border-r border-gray-200 pr-5 text-right dark:border-gray-600"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <Badge variant="secondary" className="-translate-y-3 transform">
                {DateTime.fromObject({ hour: minute / 60 }).toFormat("ha")}
              </Badge>
            </div>
          ))}
        </div>
        <div className="relative flex-1">
          <div
            className="absolute inset-0 grid w-full"
            style={{
              gridTemplateRows: `repeat(96, ${BASE_SLOT_HEIGHT}px)`,
            }} // Set the grid rows for 15-minute increments
          >
            {Array.from({ length: 96 }).map((_, index) => (
              <div
                key={index}
                className={` ${index % 4 === 3 ? "border-b border-gray-200 dark:border-gray-600" : ""}`}
                style={{
                  gridRowStart: index + 1,
                  gridRowEnd: index + 2,
                }}
              ></div>
            ))}
            {bookingsData?.bookings?.map((booking, index) => {
              const start = DateTime.fromISO(booking.startTime!, {
                zone: location.timezone,
              });
              const end = DateTime.fromISO(booking.endTime!, {
                zone: location.timezone,
              });
              const durationInMinutes = end.diff(start, "minutes").minutes;
              const height = calculateHeight(durationInMinutes); // Calculate the height based on the booking duration

              // make a new object of the booking data but convert the times to jsdate
              const bookingData = {
                ...booking,
                startTime: start.toJSDate(),
                endTime: end.toJSDate(),
              };

              return (
                <div
                  key={index}
                  className="absolute flex w-48 flex-col bg-primary p-2 text-sm text-white"
                  style={{
                    gridColumn: "1 / -1",
                    gridRowStart: calculateGridRowStart(booking.startTime!),
                    height: `${height}px`, // Set the height of the booking
                  }}
                >
                  <div className="font-semibold">{booking.customerName}</div>
                  <div className="">
                    {start.toFormat("h:mm a")} - {end.toFormat("h:mm a")}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 md:hidden"
                    asChild
                  >
                    <Link href={`/dashboard/bookings/edit/${booking.id}`}>
                      Edit
                    </Link>
                  </Button>

                  <div className="hidden md:block">
                    <EditBookingDialog
                      key={`edit${index}`}
                      location={location}
                      locationSettings={locationSettings}
                      resources={resources}
                      //id={booking.id}
                      booking={bookingData}
                      variant="secondary"
                      size="sm"
                      refetch={refetchBookings}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
                              "w-[180px] pl-3 text-left font-normal",
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
                          // This calendar is dashboard staff use, shouldnt have any min/max date
                          // disabled={(date) =>
                          //   // Disabling dates based on Luxon comparisons
                          //   DateTime.fromJSDate(date) <
                          //     DateTime.now().startOf("day") ||
                          //   DateTime.fromJSDate(date) >
                          //     DateTime.now().plus({
                          //       days: locationSettings.maxAdvanceBookingDays,
                          //     })
                          // }
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
          <div className="flex items-center justify-between space-y-2 overflow-hidden">
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
