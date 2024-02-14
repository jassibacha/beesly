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
import {
  type UpdateLocationSchemaValues,
  updateLocationSchema,
} from "@/lib/schemas/locationSchemas";
import { r2 } from "@/lib/r2";

interface LocationFormProps {
  location: Location;
  locationSettings: LocationSetting;
}

type UpdateLocationFormValues = UpdateLocationSchemaValues & {
  logo: File | string | null;
};

export function LocationForm({
  location,
  locationSettings,
}: LocationFormProps) {
  const form = useForm<UpdateLocationSchemaValues>({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      name: location.name,
      slug: location.slug,
      logo: location.logo,
      phone: location.phone ?? "",
      email: location.email ?? "",
      website: location.website ?? "",
      streetAddress: location.streetAddress ?? "",
      city: location.city ?? "",
      state: location.state ?? "",
      zipCode: location.zipCode ?? "",
      country: location.country ?? "",
      timeZone: locationSettings.timeZone,
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

  const { data: uploadData, isLoading: isUploadLoading } =
    api.upload.getUploadUrl.useQuery({
      locationId: location.id,
      extension: "png",
    });

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    console.log("Uploading file:", file);
    if (!uploadData) return null; // No upload data available

    // Upload the file to the signed URL
    const response = await fetch(uploadData.url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "image/png",
      },
    });

    if (response.ok) {
      console.log("File uploaded:", uploadData.fileName);
      // Return the URL of the uploaded file
      const logoUrl = `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${uploadData.fileName}`;
      return logoUrl;
    } else {
      // Log the error and return null
      console.error("Error uploading file:", response.statusText);
      return null;
    }
  };

  //const createBookingMutation = api.booking.book.useMutation();
  const updateLocationMutation = api.location.update.useMutation();

  const onSubmit: SubmitHandler<UpdateLocationSchemaValues> = async (
    values,
  ) => {
    console.log("values: ", values);

    // let logoUrl: string | null = location.logo ?? null; // Use the existing logo URL as the default
    // if (typeof values.logo === "object") {
    //   //if (values.logo instanceof File) {
    //   logoUrl = await handleLogoUpload(values.logo);
    // }

    // Use the existing logo URL as the default
    let logoUrl: string | null = location.logo ?? null;
    // check if values.logo is truthy and is an object, and then we check if it
    // has a name property, which is a property of a File object.
    if (
      values.logo &&
      typeof values.logo === "object" &&
      "name" in values.logo
    ) {
      console.log("values.logo is a File, uploading...");
      // safely cast values.logo to File and pass it to handleLogoUpload
      logoUrl = await handleLogoUpload(values.logo as File);
    }

    const updatedData = {
      id: location.id,
      logo: logoUrl,
      ...values,
    };

    // Prepare data for the backend. This might include formatting dates and times.
    // const updatedData = {
    //   id: location.id,
    //   ...values,
    // };

    updateLocationMutation.mutate(updatedData, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Location Updated",
          description: "Your location has been successfully updated.",
        });

        reset(updatedData);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });

        // Optionally, handle form-specific errors such as validation issues
        if ("cause" in error && error.cause instanceof ZodError) {
          for (const issue of error.cause.errors) {
            setError(issue.path[0] as keyof UpdateLocationSchemaValues, {
              message: issue.message,
            });
          }
        }
      },
    });

    // Execute mutation
    // createBookingMutation.mutate(bookingData, {
    //   onSuccess: () => {
    //     // Handle success scenario
    //     toast({
    //       variant: "success",
    //       title: "Booking Successful",
    //       description: "Your booking has been successfully created.",
    //     });

    //     // Reset form or redirect user as needed
    //     reset();
    //   },
    //   onError: (error) => {
    //     // Handle error scenario
    //     toast({
    //       variant: "destructive",
    //       title: "Booking Failed",
    //       description:
    //         error.message || "An unexpected error occurred. Please try again.",
    //     });

    //     // Optionally, handle form-specific errors such as validation issues
    //     if ("cause" in error && error.cause instanceof ZodError) {
    //       for (const issue of error.cause.errors) {
    //         setError(issue.path[0] as keyof UpdateLocationSchemaValues, {
    //           message: issue.message,
    //         });
    //       }
    //     }
    //   },
    // });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Name field */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name" aria-required={true}>
                Business Name
              </FormLabel>
              <FormControl>
                <Input
                  required
                  id="name"
                  placeholder="ACME VR Lounge"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is your locations name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug field */}
        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="slug" aria-required={true}>
                URL Slug
              </FormLabel>
              <FormControl>
                <Input required id="slug" placeholder="acme-vr" {...field} />
              </FormControl>
              <FormDescription>
                This slug will be used in your booking url.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="logo">Logo</FormLabel>
              <FormControl>
                <input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      field.onChange(e.target.files[0]);
                    }
                  }}
                />
              </FormControl>
              {location.logo && (
                <img
                  src={location.logo}
                  alt="Current Logo"
                  className="mt-2 h-16 w-16 object-cover"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone field */}
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone" aria-required={true}>
                Phone
              </FormLabel>
              <FormControl>
                <Input
                  required
                  id="phone"
                  placeholder="604-555-5555"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>Your business phone number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email field */}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email" aria-required={true}>
                Email
              </FormLabel>
              <FormControl>
                <Input
                  required
                  id="email"
                  placeholder="info@acmevr.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>Your business phone number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website field */}
        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="website">Website</FormLabel>
              <FormControl>
                <Input
                  id="website"
                  placeholder="https://www.example.com"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Street Address field */}
        <FormField
          control={control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="streetAddress">Street Address</FormLabel>
              <FormControl>
                <Input
                  id="streetAddress"
                  placeholder="123 Main St"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* City field */}
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="city">City</FormLabel>
              <FormControl>
                <Input id="city" placeholder="City Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* State field */}
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="state">State/Province</FormLabel>
              <FormControl>
                <Input id="state" placeholder="State or Province" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Zip Code field */}
        <FormField
          control={control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="zipCode">Zip/Postal Code</FormLabel>
              <FormControl>
                <Input
                  id="zipCode"
                  placeholder="Zip or Postal Code"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Country field */}
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="country" aria-required={true}>
                Country
              </FormLabel>
              <FormControl>
                <Input
                  required
                  id="country"
                  placeholder="Canada"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>Your country of business.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Zone field */}
        <FormField
          control={control}
          name="timeZone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="timeZone">Time Zone</FormLabel>
              <FormControl>
                <Input id="timeZone" placeholder="Time Zone" {...field} />
              </FormControl>
              <FormDescription>
                Timezone of Business. Default: America/Los_Angeles
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting || updateLocationMutation.isLoading}
        >
          {isSubmitting || updateLocationMutation.isLoading
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
