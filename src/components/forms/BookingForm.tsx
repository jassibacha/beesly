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
import { redirect, useRouter } from "next/navigation";
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
  resources?: Resource[];
  booking?: Booking;
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

// Helper function to calculate duration in hours based on start and end times
function calculateDuration(startTime: Date, endTime: Date): string {
  const start = DateTime.fromJSDate(startTime);
  const end = DateTime.fromJSDate(endTime);
  const duration = end.diff(start, "hours").hours;
  return duration.toFixed(1); // Return duration as a string with one decimal place
}

export function BookingForm({
  location,
  locationSettings,
  resources,
  booking,
}: BookingFormProps) {
  const isEditing = !!booking; // Determine if we are editing an existing booking

  const router = useRouter();

  const form = useForm<BookingFormSchemaValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: isEditing
        ? DateTime.fromJSDate(booking.startTime).toJSDate()
        : DateTime.now().toJSDate(),
      duration: isEditing
        ? calculateDuration(booking.startTime, booking.endTime)
        : "1.0",
      timeSlot: isEditing
        ? DateTime.fromJSDate(booking.startTime).toISO() ?? ""
        : "",
      customerName: isEditing ? booking.customerName : "",
      customerEmail: isEditing ? booking.customerEmail : "",
      customerPhone: isEditing ? booking.customerPhone : "",
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

  // Watching the date and duration field for changes
  const selectedDate = watch("date");
  const selectedDuration = watch("duration");

  // Convert the selectedDate (which is a JavaScript Date object) to a Luxon DateTime object
  const formattedSelectedDate =
    DateTime.fromJSDate(selectedDate).toFormat("ccc, LLLL dd yyyy");

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
      //includeAllSlots: isEditing, // Set to true when editing
      bookingId: isEditing ? booking.id : undefined, // Pass the booking to filter it out
    },
    {
      enabled: !!selectedDate,
    },
  );

  const [timeSlots, setTimeSlots] = useState<ExtendedTimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // States for open/close times
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
      console.log(timeSlotData.slots);

      // Set selectedTimeSlot based on the booking's start time when editing
      if (isEditing && booking) {
        const bookingStartTime = DateTime.fromISO(
          booking.startTime.toISOString(),
        )
          .setZone(locationSettings.timeZone)
          .toISO();
        setSelectedTimeSlot(bookingStartTime);
        //console.log(`selectedTimeSlot edited: ${selectedTimeSlot}`);
      }
    }
  }, [timeSlotData, timeSlotLoading, isEditing, booking]);

  useEffect(() => {
    // Reset selected time slot whenever the duration changes
    setSelectedTimeSlot(null);
  }, [selectedDuration]); // Add selectedDuration to the dependency array

  const [controlledLoading, setControlledLoading] = useState(false);

  useEffect(() => {
    // Initiate controlled loading state when duration changes
    setControlledLoading(true);

    // Reset controlled loading state after a delay
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
    if (isSelected) {
      variant = "default"; // Selected
    } else if (!slot.isAvailable) {
      variant = "destructive";
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
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {timeSlots.map(renderTimeSlotButton)}
      </div>
    );
  };

  const createBookingMutation = api.booking.book.useMutation();
  const updateBookingMutation = api.booking.update.useMutation();
  const sendEmailMutation = api.email.sendEmail.useMutation();

  const onSubmit: SubmitHandler<BookingFormSchemaValues> = (values) => {
    console.log(values);

    // Ensure bookingId is always present when editing
    if (isEditing && !booking.id) {
      console.error("Booking ID is missing for editing.");
      return;
    }

    // Prepare data for the backend. This might include formatting dates and times.
    const commonData = {
      locationId: location.id,
      startTime: DateTime.fromISO(values.timeSlot).toJSDate(),
      endTime: DateTime.fromISO(values.timeSlot)
        .plus({ minutes: parseFloat(values.duration) * 60 })
        .toJSDate(),
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
    };

    if (isEditing) {
      const updateData = { ...commonData, id: booking.id };

      // Determine if an email should be sent, check if date, startTime or duration has changed
      const dateChanged =
        DateTime.fromJSDate(booking.startTime).toISODate() !==
        DateTime.fromISO(values.timeSlot).toISODate();
      const durationChanged =
        calculateDuration(booking.startTime, booking.endTime) !==
        values.duration;
      const startTimeChanged =
        DateTime.fromJSDate(booking.startTime).toISOTime() !==
        DateTime.fromISO(values.timeSlot).toISOTime();

      // Execute mutation
      updateBookingMutation.mutate(updateData, {
        onSuccess: (data) => {
          // Handle success scenario
          toast({
            variant: "success",
            title: "Booking Updated",
            description: "Booking updated successfully.",
          });

          // After booking is successful, send an email if necessary
          if (dateChanged || durationChanged || startTimeChanged) {
            sendEmailMutation.mutate(
              {
                to: values.customerEmail,
                from: "book@jassibacha.com",
                //subject: `Booking Confirmation - ${DateTime.fromJSDate(values.date).toFormat("DDDD")}`,
                text: `Dear ${values.customerName}, your booking for ${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} has been confirmed.`,
                templateId: "d-bef6d1c8eb924c238bfb75195cb8705c",
                dynamicData: {
                  fromEmail: "book@jassibacha.com",
                  fromName: "Book Test",
                  replyEmail: "book@beesly.io",
                  replyName: "Beesly",
                  subject: `Booking Updated - ${DateTime.fromJSDate(values.date).toFormat("DDDD")}`,
                  preheader: `${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} confirmed!`,
                  heading: "Booking Updated",
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
                  locationLogo: location.logo,
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
          }

          // Reset form or redirect user as needed
          // reset(commonData);
          router.push("/dashboard");
        },
        onError: (error) => {
          // Handle error scenario
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description:
              error.message ||
              "An unexpected error occurred. Please try again.",
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
    } else {
      // Execute mutation
      createBookingMutation.mutate(commonData, {
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
              text: `Dear ${values.customerName}, your booking for ${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} has been confirmed.`,
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
                locationLogo: location.logo,
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
              error.message ||
              "An unexpected error occurred. Please try again.",
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
    }
  };

  return (
    <>
      {isEditing && (
        <div className="temp-info-display mb-8 border border-violet-400 bg-purple-900 p-4 text-sm">
          <>
            <div>Booking: true</div>
            <div>
              Start Time:{" "}
              {DateTime.fromJSDate(booking.startTime)
                .setZone(locationSettings.timeZone)
                .toFormat("ccc, LLLL dd yyyy, h:mm a")}
            </div>
            <div>
              End Time:{" "}
              {DateTime.fromJSDate(booking.endTime)
                .setZone(locationSettings.timeZone)
                .toFormat("ccc, LLLL dd yyyy, h:mm a")}
            </div>
            <div>
              Duration: {calculateDuration(booking.startTime, booking.endTime)}{" "}
              hours
            </div>
          </>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="sm:grid sm:grid-cols-2 sm:gap-4">
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
                  {/* <FormDescription>
                    The day you want to book an appointment.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="duration" aria-required={true}>
                    Session Length
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your session length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1.0">1 Hour</SelectItem>
                      <SelectItem value="1.5">1.5 Hours</SelectItem>
                      <SelectItem value="2.0">2 Hours</SelectItem>
                      <SelectItem value="2.5">2.5 Hours</SelectItem>
                      <SelectItem value="3.0">3 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                    The duration of how long you want to play.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="sm:grid sm:grid-cols-3 sm:gap-4">
            <FormField
              control={control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="customerName" aria-required={true}>
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      id="customerName"
                      placeholder=""
                      {...field}
                    />
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
                    <Input
                      required
                      id="customerPhone"
                      placeholder=""
                      {...field}
                    />
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
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
}
