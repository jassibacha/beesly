"use client";

import { z, ZodError } from "zod";
import { DateTime } from "luxon";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import {
  type SubmitHandler,
  useForm,
  Controller,
  Control,
  useWatch,
} from "react-hook-form";
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
import { notFound, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";
import {
  locationSettingsFormSchema,
  type LocationSettingsFormSchemaValues,
} from "@/lib/schemas/locationSchemas";
import { Switch } from "../ui/switch";

interface LocationFormProps {
  locationSettings: LocationSetting;
}

/**
 * Represents the days of the week.
 */
enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

/**
 * Represents the daily availability settings for a location.
 */
type DailyAvailability = Record<
  DayOfWeek,
  { open: string; close: string; isOpen: boolean }
>;

/**
 * Converts a time string to 12-hour format.
 * @param time - The time string in 24-hour format (e.g., "13:30").
 * @returns The time string in 12-hour format (e.g., "1:30 PM").
 * @throws Error if the time string is in an invalid format.
 */
function convertTo12HourFormat(time: string) {
  const [hours, minutes] = time.split(":");
  if (hours === undefined || minutes === undefined) {
    throw new Error(`Invalid time format: ${time}`);
  }
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
}

const timeSlots = [
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
  "24:00",
];

export function EditLocationSettingsForm({
  locationSettings,
}: LocationFormProps) {
  const ls = locationSettings;

  // Parse dailyAvailability and taxSettings into objects
  let dailyAvailability: DailyAvailability = {
    Monday: { open: "", close: "", isOpen: true },
    Tuesday: { open: "", close: "", isOpen: true },
    Wednesday: { open: "", close: "", isOpen: true },
    Thursday: { open: "", close: "", isOpen: true },
    Friday: { open: "", close: "", isOpen: true },
    Saturday: { open: "", close: "", isOpen: true },
    Sunday: { open: "", close: "", isOpen: true },
  };

  dailyAvailability = JSON.parse(ls.dailyAvailability) as DailyAvailability;
  // try {
  //   dailyAvailability = JSON.parse(ls.dailyAvailability) as DailyAvailability;
  //   console.log("dailyAvailability:", dailyAvailability);
  // } catch (error) {
  //   console.error("Error parsing dailyAvailability:", error);
  // }

  console.log(dailyAvailability);

  // try {
  //   taxSettings = JSON.parse(ls.taxSettings) as TaxSettings;
  //   console.log("taxSettings:", taxSettings);
  // } catch (error) {
  //   console.error("Error parsing taxSettings:", error);
  // }

  const defaultValues = {
    // dailyAvailability: ls.dailyAvailability ?? [],
    // taxSettings
    dailyAvailability: dailyAvailability,
    taxSettings: ls.taxSettings ?? "",
    initialCostOfBooking: ls.initialCostOfBooking ?? "",
    initialBookingLength: ls.initialBookingLength ?? "",
    bookingLengthIncrements: ls.bookingLengthIncrements ?? "",
    maxAdvanceBookingDays: ls.maxAdvanceBookingDays ?? "",
    sameDayLeadTimeBuffer: ls.sameDayLeadTimeBuffer ?? "",
    bufferTime: ls.bufferTime ?? "",
    timeSlotIncrements: ls.timeSlotIncrements ?? "",
    displayUnavailableSlots: ls.displayUnavailableSlots ?? false,
  };

  const form = useForm<LocationSettingsFormSchemaValues>({
    resolver: zodResolver(locationSettingsFormSchema),
    defaultValues: defaultValues,
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = form;

  const updateSettingsMutation = api.location.updateSettings.useMutation();

  const onSubmit: SubmitHandler<LocationSettingsFormSchemaValues> = async (
    values,
    event,
  ) => {
    console.log("Form submitted", values);
    console.log("formState errors", errors);
    //console.log(formState.errors);
    // Set the current data for resetting the form after submission
    const resetData = { ...values };

    // Convert dailyAvailability back to string for DB storage from JSON Object
    const dailyAvailabilityString = JSON.stringify(values.dailyAvailability);

    const updatedData = {
      ...values,
      dailyAvailability: dailyAvailabilityString,
      locationId: locationSettings.locationId,
      //id: locationSettings.id,
    };

    console.log("Submitting data to updateSettingsMutation:", updatedData);
    updateSettingsMutation.mutate(updatedData, {
      onSuccess: () => {
        console.log("Location Settings updated successfully");
        toast({
          variant: "success",
          title: "Advanced Settings Updated",
          description: "Your location has been successfully updated.",
        });

        reset(resetData);
      },
      onError: (error) => {
        console.error("Failed to update location:", error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });

        // Optionally, handle form-specific errors such as validation issues
        if ("cause" in error && error.cause instanceof ZodError) {
          for (const issue of error.cause.errors) {
            setError(issue.path[0] as keyof LocationSettingsFormSchemaValues, {
              message: issue.message,
            });
          }
        }
      },
    });
  };

  // /**
  //  * Converts a time string to 12-hour format.
  //  * @param time - The time string in 24-hour format (e.g., "13:30").
  //  * @returns The time string in 12-hour format (e.g., "1:30 PM").
  //  * @throws Error if the time string is in an invalid format.
  //  */
  // function convertTo12HourFormat(time: string) {
  //   const [hours, minutes] = time.split(":");
  //   if (hours === undefined || minutes === undefined) {
  //     throw new Error(`Invalid time format: ${time}`);
  //   }
  //   const hour = parseInt(hours, 10);
  //   const suffix = hour >= 12 ? "PM" : "AM";
  //   const displayHour = hour % 12 || 12;
  //   return `${displayHour}:${minutes} ${suffix}`;
  // }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {Object.entries(dailyAvailability).map(
          ([day, { open, close, isOpen }]) => (
            <DayTimeSelector
              key={day}
              day={day}
              control={control}
              timeSlots={timeSlots}
              convertTo12HourFormat={convertTo12HourFormat}
            />
          ),
        )}

        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          {/* Initial Cost of Booking field */}
          <FormField
            control={control}
            name="initialCostOfBooking"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="initialCostOfBooking">
                  Initial Cost of Booking
                </FormLabel>
                <FormControl>
                  <Input
                    id="initialCostOfBooking"
                    placeholder="Initial Cost of Booking"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The initial cost of booking.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Initial Booking Length field */}
          <FormField
            control={control}
            name="initialBookingLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="initialBookingLength">
                  Initial Booking Length (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    id="initialBookingLength"
                    placeholder="Initial Booking Length"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The initial length of a booking in minutes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          {/* Booking Length Increments field */}
          <FormField
            control={control}
            name="bookingLengthIncrements"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="bookingLengthIncrements">
                  Booking Length Increments (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    id="bookingLengthIncrements"
                    placeholder="Booking Length Increments"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The increments for booking length in minutes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Same Day Lead Time Buffer field */}
          <FormField
            control={control}
            name="sameDayLeadTimeBuffer"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="sameDayLeadTimeBuffer">
                  Same Day Lead Time Buffer (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    id="sameDayLeadTimeBuffer"
                    placeholder="Same Day Lead Time Buffer"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The buffer time in minutes for same-day bookings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          {/* Buffer Time field */}
          <FormField
            control={control}
            name="bufferTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="bufferTime">
                  Buffer Time (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    id="bufferTime"
                    placeholder="Buffer Time"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The buffer time in minutes between bookings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Time Slot Increments field */}
          <FormField
            control={control}
            name="timeSlotIncrements"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="timeSlotIncrements">
                  Time Slot Increments (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    id="timeSlotIncrements"
                    placeholder="Time Slot Increments"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The increments for time slots in minutes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          {/* Max Advance Booking Days field */}
          <FormField
            control={control}
            name="maxAdvanceBookingDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="maxAdvanceBookingDays">
                  Max Advance Booking Days
                </FormLabel>
                <FormControl>
                  <Input
                    id="maxAdvanceBookingDays"
                    placeholder="Max Advance Booking Days"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The maximum number of days in advance a booking can be made.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tax Settings field */}
          <FormField
            control={control}
            name="taxSettings"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="taxSettings">Tax Percentage</FormLabel>
                <FormControl>
                  <Input
                    id="taxSettings"
                    placeholder="Tax Percentage"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  For example, 12% tax would be 12.00
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Display Unavailable Slots field */}
        <FormField
          control={control}
          name="displayUnavailableSlots"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Display Unavailable Slots
                </FormLabel>
                <FormDescription>
                  Whether to display Unavailable slots in the booking portal
                  (for potential customers).
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting || updateSettingsMutation.isLoading}
        >
          {isSubmitting || updateSettingsMutation.isLoading
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}

interface DayTimeSelectorProps {
  day: string;
  control: Control<LocationSettingsFormSchemaValues>;
  timeSlots: string[];
  convertTo12HourFormat: (time: string) => string;
}

function DayTimeSelector({
  day,
  control,
  timeSlots,
  convertTo12HourFormat,
}: DayTimeSelectorProps) {
  const isOpen = useWatch({
    control,
    name: `dailyAvailability.${day as DayOfWeek}.isOpen`,
  });
  return (
    <div key={day} className="flex flex-row items-center justify-items-center">
      <div className="toggle mr-3">
        <Controller
          control={control}
          name={`dailyAvailability.${day as DayOfWeek}.isOpen`}
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel
                htmlFor={`${day}-isOpen`}
              >{`${day} Is Open`}</FormLabel> */}
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="title flex w-32 justify-items-center">
        <h3>{day}</h3>
      </div>
      <div className="w-[120px]">
        <Controller
          control={control}
          name={`dailyAvailability.${day as DayOfWeek}.open`}
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel htmlFor={`${day}-open`}>{`${day} Open`}</FormLabel> */}
              <FormControl>
                <Select
                  value={field.value}
                  name={field.name}
                  onValueChange={field.onChange}
                  disabled={!isOpen}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue
                      onBlur={field.onBlur}
                      ref={field.ref}
                      placeholder="Open Time"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={`${day}-open-${time}`} value={time}>
                        {convertTo12HourFormat(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="ml-2 mr-2 w-4">To</div>
      <div className="w-[120]">
        <Controller
          control={control}
          name={`dailyAvailability.${day as DayOfWeek}.close`}
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel htmlFor={`${day}-close`}>{`${day} Close`}</FormLabel> */}
              <FormControl>
                <Select
                  value={field.value}
                  name={field.name}
                  onValueChange={field.onChange}
                  disabled={!isOpen}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue
                      onBlur={field.onBlur}
                      ref={field.ref}
                      placeholder="Close Time"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={`${day}-close-${time}`} value={time}>
                        {convertTo12HourFormat(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default EditLocationSettingsForm;
