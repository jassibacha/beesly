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
  type UpdateLocationFormSchemaValues,
  updateLocationFormSchema,
} from "@/lib/schemas/locationSchemas";
import { r2 } from "@/lib/r2";
import { set } from "date-fns";
import { useDashboardData } from "@/hooks/useDashboardData";

interface LocationFormProps {
  location: Location;
  locationSettings: LocationSetting;
}

// Define the form values type to include the logo as File | string | null
type FormValues = UpdateLocationFormSchemaValues & {
  logo: File | string | null;
};

// export function LocationForm({
//   location,
//   locationSettings,
// }: LocationFormProps) {
export function LocationForm() {
  let { location } = useDashboardData();
  const { locationSettings, resources, isLoading, isSuccess, refetchAll } =
    useDashboardData();

  const { data: uploadData, isLoading: isUploadLoading } =
    api.r2.getLogoUploadUrl.useQuery(
      {
        locationId: location.id,
        extension: "png",
      },
      {
        enabled: !!location.id,
      },
    );

  const deleteLogoMutation = api.r2.deleteLogo.useMutation();

  const updateLocationMutation = api.location.update.useMutation();

  const defaultValues = {
    name: location.name ?? "",
    slug: location.slug ?? "",
    logo: location.logo ?? "", // File, string or null
    phone: location.phone ?? "",
    email: location.email ?? "",
    website: location.website ?? "",
    streetAddress: location.streetAddress ?? "",
    city: location.city ?? "",
    state: location.state ?? "",
    zipCode: location.zipCode ?? "",
    country: location.country ?? "",
    timeZone: locationSettings.timeZone ?? "",
  };

  const form = useForm<UpdateLocationFormSchemaValues>({
    resolver: zodResolver(updateLocationFormSchema),
    defaultValues: defaultValues,
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  // Set default values for the form outside of react-hook-forms
  // So we can force reset() when location or locationSettings change

  // const defaultValues = useMemo(
  //   () => ({
  //     name: location.name,
  //     slug: location.slug,
  //     logo: location.logo, // File, string or null
  //     phone: location.phone ?? "",
  //     email: location.email ?? "",
  //     website: location.website ?? "",
  //     streetAddress: location.streetAddress ?? "",
  //     city: location.city ?? "",
  //     state: location.state ?? "",
  //     zipCode: location.zipCode ?? "",
  //     country: location.country ?? "",
  //     timeZone: locationSettings.timeZone,
  //   }),
  //   [location, locationSettings],
  // );

  // useEffect(() => {
  //   reset(defaultValues);
  // }, [reset, defaultValues]);

  const [currentLogo, setCurrentLogo] = useState<string | null>(location.logo);

  if (
    isLoading ||
    isUploadLoading ||
    !location ||
    !locationSettings ||
    !resources
  ) {
    return <div>Loading...</div>;
  }

  if (location.logo && currentLogo === null) {
    setCurrentLogo(location.logo);
  }

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const handleLogoUpload = async (file: File) => {
    console.log("handleLogoUpload called with file:", file);

    // Check if the file size exceeds the maximum limit
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "File size exceeds the maximum limit of 1 MB.",
      });
      return null;
    }
    ``;

    if (!uploadData) {
      console.log("No upload data available");
      return null;
    }

    try {
      const response = await fetch(uploadData.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type, // Use the file's MIME type
        },
      });

      console.log("Upload response:", response);

      if (response.ok) {
        //const logoUrl = `https://${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${uploadData.fileName}`;
        const logoUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL}${uploadData.fileName}`;
        console.log("File uploaded successfully. Logo URL:", logoUrl);
        return logoUrl;
      } else {
        console.error("Error uploading file:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleDeleteLogo = async () => {
    if (location.logo) {
      deleteLogoMutation.mutate(
        { imageUrl: location.logo, locationId: location.id },
        {
          onSuccess: () => {
            toast({
              variant: "success",
              title: "Logo Deleted",
              description: "Your logo has been successfully deleted.",
              duration: 2000,
            });
            // Update the location object to remove the logo
            location = { ...location, logo: null } as Location;
            reset({ ...form.getValues(), logo: null }); // Update the form values
            //location = updatedLocation; // Update the location object
            setCurrentLogo(null);
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Logo Delete Failed",
              description:
                error.message ||
                "An unexpected error occurred. Please try again.",
            });
          },
        },
      );
    }
  };

  const onSubmit: SubmitHandler<UpdateLocationFormSchemaValues> = async (
    values,
  ) => {
    console.log("Form submitted with values:", values);
    console.log("Form errors:", form.formState.errors);

    // Use the existing logo URL as the default
    let logoUrl: string | null = location.logo ?? null;
    // check if values.logo is truthy and is an object, and then we check if it
    // has a name property, which is a property of a File object.
    if (
      values.logo &&
      typeof values.logo === "object" &&
      "name" in values.logo
    ) {
      console.log("Logo file detected, uploading...");
      // safely cast values.logo to File and pass it to handleLogoUpload
      logoUrl = await handleLogoUpload(values.logo);

      console.log("Uploaded logo URL:", logoUrl);
      setCurrentLogo(logoUrl);
    } else {
      console.log("No logo file detected or invalid logo value.");
    }

    const updatedData = {
      ...values,
      id: location.id,
      logo: logoUrl,
    };

    console.log("Submitting data to updateLocationMutation:", updatedData);
    updateLocationMutation.mutate(updatedData, {
      onSuccess: () => {
        console.log("Location updated successfully");
        toast({
          variant: "success",
          title: "Location Updated",
          description: "Your location has been successfully updated.",
        });

        reset(updatedData);
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
            setError(issue.path[0] as keyof UpdateLocationFormSchemaValues, {
              message: issue.message,
            });
          }
        }
      },
    });
  };

  if (isSuccess && location) {
    //reset(defaultValues);
  }

  // reset(defaultValues);

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

        {/* Logo field */}
        {location.logo && currentLogo ? (
          <FormItem>
            <FormLabel className="">Logo</FormLabel>
            <div className="flex items-center space-x-4">
              <img
                src={location.logo}
                alt="Current Logo"
                className="max-h-[300px] max-w-[300px] object-contain"
              />
              <Button
                variant="destructive"
                onClick={handleDeleteLogo}
                className="flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>
            </div>
          </FormItem>
        ) : (
          <FormField
            control={control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="logo">Logo</FormLabel>
                <FormControl>
                  <Input
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
                <FormDescription>
                  File type PNG. Maximum file size 1MB. Recommended dimensions:
                  400px or larger.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
