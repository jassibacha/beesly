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
  type BookingFormSchemaValues,
  bookingFormSchema,
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

// interface BookingSlot {
//   id: string;
//   startTime: string; // Should this be ISOString or Date Obj? We can't save as ISO to DB right now for some reason
//   endTime: string; // Same as above
// }

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

  // Convert the selectedDate (which is a JavaScript Date object) to a Luxon DateTime object
  const formattedSelectedDate =
    DateTime.fromJSDate(selectedDate).toFormat("cccc, LLLL dd yyyy");

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

  const [controlledLoading, setControlledLoading] = useState(false);

  useEffect(() => {
    // Initiate controlled loading state when duration changes
    setControlledLoading(true);

    // Reset controlled loading state after a delay (e.g., 500ms)
    const timer = setTimeout(() => setControlledLoading(false), 300);

    // Cleanup timeout on component unmount or before running effect again
    return () => clearTimeout(timer);
  }, [selectedDuration]);

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
        type="button" // Not the submit button!
      >
        {DateTime.fromISO(slot.startTime).toFormat("h:mm a")}
        {/* -{" "}{DateTime.fromISO(slot.endTime).toFormat("h:mm a")} */}
      </Button>
    );
  };

  // Updated render logic for time slots
  const renderTimeSlotSelection = () => {
    if (timeSlotLoading || controlledLoading)
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

  const createBookingMutation = api.booking.book.useMutation();
  const sendEmailMutation = api.email.sendEmail.useMutation();

  const onSubmit: SubmitHandler<BookingFormSchemaValues> = (values) => {
    console.log(values);

    // Prepare data for the backend. This might include formatting dates and times.
    const bookingData = {
      locationId: location.id,
      startTime: DateTime.fromISO(values.timeSlot).toJSDate(), // Assuming this is the ISO string of the start time
      endTime: DateTime.fromISO(values.timeSlot)
        .plus({ minutes: parseFloat(values.duration) * 60 })
        .toJSDate(), // Calculate end time based on duration
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      // Add any other fields required by your backend
    };

    // Execute mutation
    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        // Handle success scenario
        toast({
          variant: "success",
          title: "Booking Successful",
          description: "Your booking has been successfully created.",
        });

        // Reset form or redirect user as needed
        reset();

        // After booking is successful, send an email
        sendEmailMutation.mutate(
          {
            to: values.customerEmail,
            from: "book@jassibacha.com",
            //subject: `Booking Confirmation - ${DateTime.fromJSDate(values.date).toFormat("DDDD")}`,
            text: `Text Dear ${values.customerName}, your booking for ${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} has been confirmed.`,
            templateId: "d-bef6d1c8eb924c238bfb75195cb8705c",
            dynamicData: {
              fromEmail: "book@jassibacha.com",
              fromName: "Book Test",
              replyEmail: "book@beesly.io",
              replyName: "Beesly",
              subject: `Booking Confirmation - ${DateTime.fromJSDate(values.date).toFormat("DDDD")}`,
              preheader: `${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} confirmed!`,
              heading: "Booking Confirmed!",
              textBody: `Dear ${values.customerName}, your booking for ${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} has been confirmed.`,
              date: DateTime.fromJSDate(values.date).toFormat("DDDD"),
              startTime: DateTime.fromISO(values.timeSlot)
                .setZone(locationSettings.timeZone)
                .toFormat("h:mm a"),
              endTime: DateTime.fromISO(values.timeSlot)
                .plus({ minutes: parseFloat(values.duration) * 60 })
                .setZone(locationSettings.timeZone)
                .toFormat("h:mm a"),
              customerName: values.customerName,
              customerEmail: values.customerEmail,
              customerPhone: values.customerPhone,
              locationName: location.name,
              locationPhone: location.phone,
              locationEmail: location.email,
            },
          },
          {
            onSuccess: () => {
              // Create a db entry that it succeeded?
              // toast({
              //   variant: "success",
              //   title: "Email Sent",
              //   description:
              //     "A confirmation email has been sent to the customer.",
              // });
            },
            onError: (error) => {
              // Create a db entry that it failed?
              console.error("Failed to send confirmation email:", error);
              // toast({
              //   variant: "destructive",
              //   title: "Email Sending Failed",
              //   description:
              //     "Failed to send a confirmation email. Please contact support.",
              // });
            },
          },
        );
      },
      onError: (error) => {
        // Handle error scenario
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });

        // Optionally, handle form-specific errors such as validation issues
        if ("cause" in error && error.cause instanceof ZodError) {
          for (const issue of error.cause.errors) {
            setError(issue.path[0] as keyof BookingFormSchemaValues, {
              message: issue.message,
            });
          }
        }
      },
    });
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
              <FormLabel>
                Available Start Times on {formattedSelectedDate}
              </FormLabel>
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
