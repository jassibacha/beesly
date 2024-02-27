"use client";

import { z, ZodError } from "zod";
import { DateTime } from "luxon";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
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

type DailyAvailability = Record<string, { open: string; close: string }>;
type TaxSettings = Record<string, number>;

export function EditLocationSettingsForm({
  locationSettings,
}: LocationFormProps) {
  const ls = locationSettings;

  // Parse dailyAvailability and taxSettings into objects
  let dailyAvailability: DailyAvailability = {
    Monday: { open: "", close: "" },
    Tuesday: { open: "", close: "" },
    Wednesday: { open: "", close: "" },
    Thursday: { open: "", close: "" },
    Friday: { open: "", close: "" },
    Saturday: { open: "", close: "" },
    Sunday: { open: "", close: "" },
  };
  let taxSettings: TaxSettings = {};

  try {
    dailyAvailability = JSON.parse(ls.dailyAvailability) as DailyAvailability;
    console.log("dailyAvailability:", dailyAvailability);
  } catch (error) {
    console.error("Error parsing dailyAvailability:", error);
  }

  console.log(dailyAvailability);

  try {
    taxSettings = JSON.parse(ls.taxSettings) as TaxSettings;
    console.log("taxSettings:", taxSettings);
  } catch (error) {
    console.error("Error parsing taxSettings:", error);
  }

  const defaultValues = {
    // dailyAvailability: ls.dailyAvailability ?? [],
    // taxSettings
    dailyAvailability: dailyAvailability,
    taxSettings: taxSettings,
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
    formState: { isSubmitting },
  } = form;

  //const updateLocationMutation = api.location.update.useMutation();

  const onSubmit: SubmitHandler<LocationSettingsFormSchemaValues> = async (
    values,
  ) => {
    const updatedData = {
      ...values,
      locationId: locationSettings.locationId,
    };

    console.log("Submitting data to updateLocationMutation:", updatedData);
    // updateLocationMutation.mutate(updatedData, {
    //   onSuccess: () => {
    //     console.log("Location updated successfully");
    //     toast({
    //       variant: "success",
    //       title: "Location Updated",
    //       description: "Your location has been successfully updated.",
    //     });

    //     reset(updatedData);
    //   },
    //   onError: (error) => {
    //     console.error("Failed to update location:", error);
    //     toast({
    //       variant: "destructive",
    //       title: "Update Failed",
    //       description:
    //         error.message || "An unexpected error occurred. Please try again.",
    //     });

    //     // Optionally, handle form-specific errors such as validation issues
    //     if ("cause" in error && error.cause instanceof ZodError) {
    //       for (const issue of error.cause.errors) {
    //         setError(issue.path[0] as keyof UpdateLocationFormSchemaValues, {
    //           message: issue.message,
    //         });
    //       }
    //     }
    //   },
    // });
  };

  const timeSlots = ["09:00", "10:00", "11:00", "22:00", "23:00"];

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* {Object.entries(dailyAvailability).map(([day, { open, close }]) => (
        <div key={day}>
          <FormField
            control={control}
            name={`dailyAvailability.${day}.open`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`${day}-open`}>{`${day} Open`}</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Open Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`${day}-open-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Select opening time for {day}.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`dailyAvailability.${day}.close`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`${day}-close`}>{`${day} Close`}</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Close Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`${day}-close-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Select closing time for {day}.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))} */}

        <FormField
          control={control}
          name={"dailyAvailability.Monday.open"}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`Monday-open`}>{`Monday Open`}</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Open Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={`Monday-open`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select opening time for Monday.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={control}
          name="dailyAvailability"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="namehere">Name</FormLabel>
              <FormControl>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Your name.</FormDescription>
              <FormMessage />
            </FormItem>
          )} /> */}

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
        {/* Buffer Time field */}
        <FormField
          control={control}
          name="bufferTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="bufferTime">Buffer Time (minutes)</FormLabel>
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
                  Receive emails about your account activity and security.
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
          // disabled={isSubmitting || updateLocationMutation.isLoading}
        >
          {isSubmitting //|| updateLocationMutation.isLoading
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
