"use client";

import { z, ZodError } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  type CreateLocationSchemaValues,
  createLocationSchema,
} from "@/lib/schemas/locationSchemas";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "@/context/UserContext";
import { useLocationContext } from "@/context/LocationContext";

function CreateLocationForm() {
  const { toast } = useToast();
  const {
    user,
    isLoading: userIsLoading,
    refetch: refetchUser,
  } = useDashboardUser();
  const { refetchAll } = useLocationContext();

  const router = useRouter();

  // 1. Define your form.
  const form = useForm<CreateLocationSchemaValues>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: "",
      slug: "",
      phone: "",
      email: "",
      website: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      timezone: "",
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const createLocationMutation = api.location.create.useMutation();

  // 2. Define a submit handler.
  const onSubmit: SubmitHandler<CreateLocationSchemaValues> = (values) => {
    console.log(values);

    createLocationMutation.mutate(values, {
      onSuccess: () => {
        // Lazy initialize the router inside the onSuccess callback

        // Redirect to the dashboard
        // Once redirected, show the toast
        toast({
          variant: "success",
          title: "Success!",
          description: "Your Business has been created.",
        });

        void refetchUser();
        void refetchAll();
        console.log("New Location: User & Location Contexts refetched");

        router.push("/dashboard");
      },
      onError: (error) => {
        // Handle error
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An error occurred",
        });

        if ("cause" in error && error.cause instanceof ZodError) {
          for (const issue of error.cause.errors) {
            setError(issue.path[0] as keyof CreateLocationSchemaValues, {
              message: issue.message,
            });
          }
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form
        id="create-location-form"
        className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
      >
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
              <FormDescription>Your business email address.</FormDescription>
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
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="timezone">Time Zone</FormLabel>
              <FormControl>
                <Input id="timezone" placeholder="Time Zone" {...field} />
              </FormControl>
              <FormDescription>
                Timezone of Business. Default: America/Los_Angeles
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          form="create-location-form"
          type="submit"
          aria-disabled={isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default CreateLocationForm;
