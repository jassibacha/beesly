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

function CreateLocationForm() {
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<CreateLocationSchemaValues>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: "",
      slug: "",
      phone: "",
      email: "",
      country: "",
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
        // Handle success
        toast({
          variant: "success",
          title: "Success!",
          description: "Your Business has been created.",
        });
        reset();
        // TODO: Set onboarded to true on the user here or in tRPC
        // Redirect back to the dashboard
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
        className="w-2/3 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name" aria-required={true}>
                Location Name
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
