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
import { DialogClose } from "../ui/dialog";
import { EmailTemplateType } from "@/types/emailTypes";
import { error } from "console";

interface BookingFormProps {
  location: Location;
  locationSettings: LocationSetting;
  resources?: Resource[];
  booking?: Booking;
  viewContext: "dashboard" | "dialog" | "portal";
  closeDialog?: () => void;
  refetch?: () => void;
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
  viewContext,
  closeDialog,
  refetch,
}: BookingFormProps) {
  const isEditing = !!booking; // Determine if we are editing an existing booking
  const isCancelled = booking?.status === "CANCELLED"; // Determine if the booking is cancelled
  const isCompleted = booking?.status === "COMPLETED"; // Determine if the booking is completed
  const isDialog = viewContext === "dialog"; // Determine if we are in a dialog
  const isDashboard = viewContext === "dashboard"; // Determine if we are on a dashboard page
  //const isDialog = !!isInDialog; // Determine if we are in a dialog

  const router = useRouter();

  const [refreshForm, setRefreshForm] = useState<string>("initial");
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
  // const [openCloseTimes, setOpenCloseTimes] = useState<{
  //   open: string;
  //   close: string;
  // } | null>(null);

  useEffect(() => {
    // Set timeslots and open/close times when the data is available
    if (timeSlotData && !timeSlotLoading) {
      console.log("Setting timeSlots + open/close times");
      setTimeSlots(timeSlotData.slots);

      // setOpenCloseTimes({
      //   open: timeSlotData.openTimeISO!,
      //   close: timeSlotData.closeTimeISO!,
      // });
      // console.log(timeSlotData.slots);

      // Set selectedTimeSlot based on the booking's start time when editing
      if (isEditing && booking) {
        const bookingStartTime = DateTime.fromISO(
          booking.startTime.toISOString(),
        )
          .setZone(location.timezone)
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
    if (timeSlotData && !timeSlotData.isOpen)
      return (
        <div className="flex flex-col justify-center justify-items-center">
          Closed for this day.
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
  const cancelBookingMutation = api.booking.cancel.useMutation();
  const sendBookingEmailMutation = api.email.sendBookingEmail.useMutation();

  const handleCancelBooking = () => {
    if (booking && location) {
      cancelBookingMutation.mutate(
        { bookingId: booking.id, locationId: location.id },
        {
          onSuccess: () => {
            toast({
              variant: "success",
              title: "Booking Cancelled",
              description: "The booking has been successfully cancelled.",
            });
            if (isDashboard) {
              router.push("/dashboard"); // Redirect to the dashboard or another appropriate page
            } else if (isDialog) {
              // Refetch the bookings from the parent component
              if (refetch) void refetch();
            }
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Cancellation Failed",
              description: error.message || "An unexpected error occurred.",
            });
          },
        },
      );
    }
  };

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
            if (data?.booking) {
              sendBookingEmailMutation.mutate({
                templateType: EmailTemplateType.BookingUpdate,
                booking: data.booking,
                location,
                locationSettings,
              });
            }
          }

          // Reset form or redirect user as needed
          // TODO: Conditional for dialog or page
          // reset(commonData);
          if (viewContext === "dashboard") {
            router.push("/dashboard");
          } else if (viewContext === "dialog") {
            // Refetch the bookings from the parent component
            if (refetch) void refetch();
          }
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
        onSuccess: (data) => {
          // Handle success scenario
          toast({
            variant: "success",
            title: "Booking Successful",
            description: "Your booking has been successfully created.",
          });

          // Reset form or redirect user as needed
          reset();

          if (data?.booking) {
            console.log("Booking data:", data.booking);
            sendBookingEmailMutation.mutate({
              templateType: EmailTemplateType.BookingConfirmation,
              booking: data.booking,
              location,
              locationSettings,
            });

            // Redirect to thank-you page with booking details as query parameters
            if (viewContext === "portal") {
              router.push(`/${location.slug}/thank-you/${data.booking.id}`);
            } else if (viewContext === "dashboard") {
              router.push("/dashboard");
            } else if (viewContext === "dialog") {
              // Refetch the bookings from the parent component
              if (refetch) void refetch();
            }
          }

          // TODO: Can we check if we're on the booking portal? If so, redirect to thank you page.
          // Otherwise, if we're on a page it's the dashboard, so go back to the dashboard.
          // Lastly, if we're in a dialog, close the dialog.
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
      <div>
        <div className="temp-info-display mb-8 border border-violet-400 bg-purple-900 p-4 text-sm">
          <div>View Context: {viewContext}</div>

          {isEditing && (
            <>
              <div>Booking: {booking ? "true" : "false"}</div>
              {booking && (
                <>
                  <div>Status: {booking.status}</div>
                  <div>
                    Date:{" "}
                    {DateTime.fromJSDate(booking.startTime)
                      .setZone(location.timezone)
                      .toFormat("ccc, LLL dd yyyy")}
                  </div>
                </>
              )}
              {booking && (
                <div>
                  Time:{" "}
                  {DateTime.fromJSDate(booking.startTime)
                    .setZone(location.timezone)
                    .toFormat("h:mma")}{" "}
                  -{" "}
                  {DateTime.fromJSDate(booking.endTime)
                    .setZone(location.timezone)
                    .toFormat("h:mma")}{" "}
                  ({calculateDuration(booking.startTime, booking.endTime)}{" "}
                  Hours)
                </div>
              )}
            </>
          )}
          {!isEditing && <div>Booking: false</div>}
        </div>

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
                name="customerName"
                control={control}
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
                name="customerPhone"
                control={control}
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
                name="customerEmail"
                control={control}
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

            <div className="flex space-x-2">
              {!isCancelled && !isCompleted && (
                <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
              )}

              {isEditing &&
                !isCancelled &&
                !isCompleted &&
                (isDialog || isDashboard) && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelBooking}
                  >
                    Cancel
                  </Button>
                )}

              {/* Specific close for the dialog */}

              {isDialog && (
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                // <Button
                //     type="button"
                //     variant="secondary"
                //     onClick={closeDialog}
                //     className="ml-2"
                //   >
                //     Close2
                //   </Button>
              )}

              {isDashboard && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
