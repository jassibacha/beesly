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

  const dayOfWeek = DateTime.fromJSDate(selectedDate).toFormat("cccc");

  // tRPC query to fetch bookings, dependent on selectedDate
  // TODO: Add in availability filters for open/close times
  const bookingsForDate =
    api.booking.fetchAvailabilityAndBookingsForDate.useQuery(
      {
        locationId: location.id,
        // Ensure selectedDate is in an appropriate format for your backend
        date: selectedDate,
        dayOfWeek: dayOfWeek,
      },
      {
        // Only run the query if a date is selected, or changed
        enabled: !!selectedDate,
      },
    );

  // Add a new state for duration in your BookingForm component
  const [selectedDuration, setSelectedDuration] = useState(null);

  const fetchAvailableTimeSlots = async (
    date: DateTime,
    duration: string,
    bookings: [],
  ) => {
    // Calculate available time slots based on `date`, `duration`, and existing `bookings`
    // This could involve checking each potential start time within the day against the existing bookings
    // to ensure there's enough room for the specified duration
    // Return an array of strings representing the start times of available slots
  };

  // // State to hold available time slots
  // const [timeSlots, setTimeSlots] = useState<string[]>([]);
  // const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // // Fetch available time slots when the date or duration changes
  // useEffect(() => {
  //   const fetchTimeSlots = async () => {
  //     const date = DateTime.fromJSDate(form.watch("date"));
  //     const duration = form.watch("duration");
  //     const slots = await fetchAvailableTimeSlots(date, duration, bookings);
  //     setTimeSlots(slots || []);
  //     setSelectedTimeSlot(""); // Optionally reset selected time slot
  //   };

  //   fetchTimeSlots();
  // }, [form.watch("date"), form.watch("duration"), bookings]); // Note the addition of bookings as a dependency

  // const handleTimeSlotSelect = (slot: string) => {
  //   setSelectedTimeSlot(slot);
  //   form.setValue("timeSlot", slot); // Update the form's timeSlot field
  // };

  // const transformFormData = (formData) => {
  //   // Example: Transforming formData to match the createBookingSchema
  //   const startTime = DateTime.fromJSDate(formData.date)
  //     .set({
  //       hour: extractHour(formData.timeSlot),
  //       minute: extractMinute(formData.timeSlot),
  //     })
  //     .toJSDate();

  //   const endTime = DateTime.fromJSDate(startTime)
  //     .plus({ hours: formData.duration })
  //     .toJSDate();

  //   return { startTime, endTime };
  // };

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
              <div className="flex flex-wrap">
                Timeslots will go here
                {/* {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    onClick={() => handleTimeSlotSelect(slot)}
                    // className={`m-1 ${selectedTimeSlot === slot ? "bg-blue-500 text-white" : "bg-transparent"}`}
                  >
                    {slot}
                  </Button>
                ))} */}
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
                Business Name
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
                Business Name
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
