"use client";

import { z, ZodError } from "zod";
import { DateTime } from "luxon";
import { CalendarIcon, Loader2 } from "lucide-react";
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

interface ExtendedTimeSlot {
  startTime: string; // Should this be ISOString or Date Obj? We can't save as ISO to DB right now for some reason
  endTime: string; // Same as above
  isAvailable: boolean;
}

interface BookingSlot {
  id: string;
  startTime: string; // Should this be ISOString or Date Obj? We can't save as ISO to DB right now for some reason
  endTime: string; // Same as above
}

type ButtonVariant =
  | "link"
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost";

interface ButtonProps {
  variant?: ButtonVariant; // This ensures variant accepts specific values only
  // Other props
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

  // Watching the date field for changes
  const selectedDate = watch("date");
  const selectedDuration = watch("duration");
  // console.log("SELECTEDDATE: ", selectedDate);

  // tRPC query to fetch time slots (available and unavailable)
  const {
    data: timeSlotData,
    isLoading: timeSlotLoading,
    error: timeSlotError,
  } = api.booking.getAvailableTimeSlots.useQuery(
    {
      locationId: location.id,
      date: selectedDate,
      duration: selectedDuration,
    },
    {
      enabled: !!selectedDate,
    },
  );

  const [timeSlots, setTimeSlots] = useState<ExtendedTimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // States for open/close times and bookings
  const [openCloseTimes, setOpenCloseTimes] = useState<{
    open: string;
    close: string;
  } | null>(null);
  // const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
  // const [availableTimeSlots, setAvailableTimeSlots] = useState<
  //   ExtendedTimeSlot[]
  // >([]);
  //const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    // Set timeslots and open/close times when the data is available
    if (timeSlotData && !timeSlotLoading) {
      console.log("Setting timeSlots + open/close times");
      setTimeSlots(timeSlotData.slots);

      setOpenCloseTimes({
        open: timeSlotData.openTimeISO!,
        close: timeSlotData.closeTimeISO!,
      });
    }
  }, [timeSlotData, timeSlotLoading]);

  useEffect(() => {
    // Reset selected time slot whenever the duration changes
    setSelectedTimeSlot(null);
  }, [selectedDuration]); // Add selectedDuration to the dependency array

  // Time slot button logic
  const renderTimeSlotButton = (slot: ExtendedTimeSlot, index: number) => {
    // Determine if the slot is the currently selected one
    const isSelected = selectedTimeSlot === slot.startTime;

    // Determine the variant based on availability and selection
    let variant: ButtonVariant = "outline"; // Default to available but not selected
    if (!slot.isAvailable) {
      variant = "destructive"; // Not available
    } else if (isSelected) {
      variant = "default"; // Selected
    }

    return (
      <Button
        key={index}
        disabled={!slot.isAvailable} // Disable if not available
        variant={variant} // Use the determined variant
        size="sm"
        className=""
        onClick={() => {
          if (slot.isAvailable) {
            form.setValue("timeSlot", slot.startTime); // Set this slot as the selected time slot
            setSelectedTimeSlot(slot.startTime); // Update local state for UI feedback
          }
        }}
      >
        {DateTime.fromISO(slot.startTime).toFormat("h:mm a")}
        {/* -{" "}{DateTime.fromISO(slot.endTime).toFormat("h:mm a")} */}
      </Button>
    );
  };

  // Updated render logic for time slots
  const renderTimeSlotSelection = () => {
    if (timeSlotLoading)
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin" />{" "}
          {/* Loading icon with spin animation */}
          <span>Loading time slots...</span>
        </div>
      );
    if (timeSlots.length === 0)
      return (
        <div className="flex flex-col justify-center justify-items-center">
          No available time slots.
        </div>
      ); // Display when no time slots are available

    return (
      <div className="grid grid-cols-6 gap-2">
        {timeSlots.map(renderTimeSlotButton)}
      </div>
    );
  };

  const onSubmit: SubmitHandler<CreateBookingSchemaValues> = (values) => {
    console.log(values);

    // Form Submission Logic Will Go Here
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
                          DateTime.now().plus({ days: 60 }) // TOOD: Change this to dynamic setting for max days
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
              <FormLabel>Start Time</FormLabel>
              <div className="w-full ">{renderTimeSlotSelection()}</div>
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
