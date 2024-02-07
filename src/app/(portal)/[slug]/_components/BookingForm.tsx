"use client";

import { z, ZodError } from "zod";
import { DateTime } from "luxon";
import { CalendarIcon } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CreateBookingSchemaValues,
  createBookingSchema,
} from "@/lib/schemas/bookingSchemas";

import { useToast, toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";

interface BookingFormProps {
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
}

interface TimeSlot {
  startTime: string; // Should this be ISOString or Date Obj? We can't save as ISO to DB right now for some reason
  endTime: string; // Same as above
}

interface BookingSlot {
  id: string;
  startTime: string; // Should this be ISOString or Date Obj? We can't save as ISO to DB right now for some reason
  endTime: string; // Same as above
}

export const bookingFormSchema = z.object({
  date: z.date({
    required_error: "Booking date is required.",
  }),
  duration: z
    .string({
      required_error: "Duration is required.",
    })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Duration must be a number.",
    }),
  timeSlot: z.string({
    required_error: "Time slot selection is required.",
  }), // Could be a string like "10:30 AM", which you would convert to a DateTime object
  customerName: z.string({ required_error: "Name is required." }),
  customerEmail: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address."),
  customerPhone: z.string({ required_error: "Phone is required." }),
});

export type BookingFormSchemaValues = z.infer<typeof bookingFormSchema>;

// interface DailyAvailability {
//   [key: string]: {
//     open: string;
//     close: string;
//   };
// }

// interface DailyAvailability {
//   [day: string]: { open: string; close: string };
// }

export function BookingForm({
  location,
  locationSettings,
  resources,
}: BookingFormProps) {
  const form = useForm<BookingFormSchemaValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: DateTime.now().toJSDate(),
      duration: "1",
      timeSlot: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
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

  // const createBookingMutation = api.booking.create.useMutation();

  const [bookings, setBookings] = useState<[]>([]); // Assuming Booking is your booking type

  // Watching the date field for changes
  const selectedDate = watch("date");
  console.log("SELECTEDDATE: ", selectedDate);

  //const dayOfWeek = DateTime.fromJSDate(selectedDate).toFormat("cccc");

  const selectedDuration = watch("duration");

  // tRPC query to fetch bookings, dependent on selectedDate
  // TODO: Add in availability filters for open/close times
  const {
    data: availabilityAndBookingsForDate,
    isLoading: availabilityIsLoading,
    error: availabilityError,
  } = api.booking.getAvailableTimeSlots.useQuery(
    {
      locationId: location.id,
      // Ensure selectedDate is in an appropriate format for your backend
      date: selectedDate,
      duration: selectedDuration,
      // dayOfWeek: dayOfWeek,
    },
    {
      // Only run the query if a date is selected, or changed
      enabled: !!selectedDate,
    },
  );

  // Add a new state for duration in your BookingForm component
  //const [selectedDuration, setSelectedDuration] = useState(null);

  // States for open/close times and bookings
  const [openCloseTimes, setOpenCloseTimes] = useState<{
    open: string;
    close: string;
  } | null>(null);
  const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Effect hook to set data once it's loaded
  useEffect(() => {
    if (
      availabilityAndBookingsForDate &&
      !availabilityIsLoading &&
      !availabilityError
    ) {
      const { openTimeISO, closeTimeISO, existingBookings, availableSlots } =
        availabilityAndBookingsForDate;

      // Map over existingBookings and ensure startTime and endTime are not null
      const adjustedExistingBookings = existingBookings.map((booking) => ({
        id: booking.id,
        startTime: booking.startTime ?? "", // Convert null to empty string
        endTime: booking.endTime ?? "", // Convert null to empty string
      }));

      setOpenCloseTimes({
        open: openTimeISO!,
        close: closeTimeISO!,
      });
      setExistingBookings(adjustedExistingBookings);
      setAvailableTimeSlots(availableSlots);
    }
  }, [
    availabilityAndBookingsForDate,
    availabilityIsLoading,
    availabilityError,
  ]);

  // Function to get the variant for a time slot button
  const getTimeSlotButtonVariant = (slotStartTime: string) => {
    return selectedTimeSlot === slotStartTime ? "default" : "outline";
  };

  const onSubmit: SubmitHandler<CreateBookingSchemaValues> = (values) => {
    console.log(values);

    // const startTime = DateTime.fromJSDate(selectedDate).set({
    //   hour: selectedTimeSlot.hour,
    //   minute: selectedTimeSlot.minute,
    // });

    // const endTime = startTime.plus({ minutes: selectedDuration * 60 });

    // createBookingMutation.mutate(values, {}) will go here with onSuccess and onError
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="date" aria-required={true}>
                Booking Date
              </FormLabel>
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
                          DateTime.now().plus({ days: 60 }) // Assuming 60 days is your max range
                      // TODO: Change this to dynamic setting for max days
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The day you want to book an appointment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="duration" aria-required={true}>
                Session Length
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your session length" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="1.5">1.5 Hours</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage email addresses in your.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Slot Selection */}
        <FormField
          name="timeSlot"
          control={form.control}
          render={() => (
            <FormItem className="flex flex-col">
              <FormLabel>Time Slot</FormLabel>
              <div className="flex flex-col flex-wrap">
                {availabilityIsLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {openCloseTimes && (
                      <div>
                        Open:{" "}
                        {DateTime.fromISO(openCloseTimes.open)
                          .setZone(locationSettings.timeZone)
                          .toLocaleString(DateTime.TIME_SIMPLE)}
                        {" - "}
                        Close:{" "}
                        {DateTime.fromISO(openCloseTimes.close)
                          .setZone(locationSettings.timeZone)
                          .toLocaleString(DateTime.TIME_SIMPLE)}
                      </div>
                    )}

                    {existingBookings.length > 0 && (
                      <div>
                        <h3>Existing Bookings:</h3>
                        {existingBookings.map((booking, index) => (
                          <div key={index}>
                            {DateTime.fromISO(booking.startTime)
                              .setZone(locationSettings.timeZone)
                              .toLocaleString(DateTime.DATETIME_SHORT)}
                            {" - "}
                            {DateTime.fromISO(booking.endTime)
                              .setZone(locationSettings.timeZone)
                              .toLocaleString(DateTime.DATETIME_SHORT)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <h3>Available Slots:</h3>
                      <div className="flex flex-wrap">
                        {availableTimeSlots.map((slot, index) => (
                          <Button
                            key={index}
                            type="button"
                            size="sm"
                            variant={getTimeSlotButtonVariant(slot.startTime)}
                            onClick={() => setSelectedTimeSlot(slot.startTime)}
                          >
                            {DateTime.fromISO(slot.startTime)
                              .setZone(locationSettings.timeZone)
                              .toLocaleString(DateTime.TIME_SIMPLE)}
                            {" - "}
                            {DateTime.fromISO(slot.endTime)
                              .setZone(locationSettings.timeZone)
                              .toLocaleString(DateTime.TIME_SIMPLE)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* {timeSlots.length === 0 && (
                <FormDescription>No available time slots.</FormDescription>
              )} */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customerName" aria-required={true}>
                Name
              </FormLabel>
              <FormControl>
                <Input required id="customerName" placeholder="" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customerPhone" aria-required={true}>
                Phone
              </FormLabel>
              <FormControl>
                <Input required id="customerPhone" placeholder="" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customerEmail" aria-required={true}>
                Email
              </FormLabel>
              <FormControl>
                <Input
                  required
                  id="customerEmail"
                  placeholder=""
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
