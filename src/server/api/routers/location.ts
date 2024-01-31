import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { locations, locationSettings } from "@/server/db/schema";

import {
  createLocationSchema,
  locationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export const locationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        try {
          // Validate the input using the Zod schema
          createLocationSchema.parse(input);

          const userId = ctx.auth.userId;
          if (!userId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "No user id found in session",
            });
          }

          const newLocationId = uuidv4();
          // Insert the new location
          await tx.insert(locations).values({
            id: newLocationId,
            ownerId: userId,
            name: input.name,
            slug: input.slug,
            phone: input.phone,
            email: input.email,
            country: input.country,
          });

          // Define default location settings
          const defaultSettings = {
            timeZone: "America/Los_Angeles",
            dailyAvailability: {
              Monday: { open: "10:00", close: "22:00" },
              Tuesday: { open: "10:00", close: "22:00" },
              Wednesday: { open: "10:00", close: "22:00" },
              Thursday: { open: "10:00", close: "22:00" },
              Friday: { open: "10:00", close: "22:00" },
              Saturday: { open: "10:00", close: "22:00" },
              Sunday: { open: "10:00", close: "22:00" },
            },
            taxSettings: {
              GST: 5,
            },
            initialCostOfBooking: "0",
            initialBookingLength: 60,
            bookingLengthIncrements: 30,
            maxAdvanceBookingDays: 60,
            minTimeBetweenBookings: 15,
            bufferTimeInMinutes: 15,
          };

          const newLocationSettingsId = uuidv4();

          // Insert default location settings for this location
          await tx.insert(locationSettings).values({
            id: newLocationSettingsId,
            locationId: newLocationId,
            ...defaultSettings,
          });

          return { success: true, id: newLocationId };
        } catch (error) {
          if (error instanceof ZodError) {
            const errorMessage = error.errors
              .map((e) => `${e.path.join(".")} - ${e.message}`)
              .join("; ");
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Validation failed: ${errorMessage}`,
            });
          }
          throw error; // Re-throw other errors
        }
      });
      // try {
      //   // Validate the input using the Zod schema
      //   createLocationSchema.parse(input);

      //   const userId = ctx.auth.userId;
      //   if (!userId) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: "No user id found in session",
      //     });
      //   }

      //   const newLocationId = uuidv4();
      //   await ctx.db.insert(locations).values({
      //     id: newLocationId,
      //     ownerId: userId,
      //     name: input.name,
      //     slug: input.slug,
      //     phone: input.phone,
      //     email: input.email,
      //     country: input.country,
      //   });
      //   return { success: true, id: newLocationId };
      // } catch (error) {
      //   if (error instanceof ZodError) {
      //     // Construct a custom error message from Zod error details
      //     const errorMessage = error.errors
      //       .map((e) => `${e.path.join(".")} - ${e.message}`)
      //       .join("; ");
      //     throw new TRPCError({
      //       code: "BAD_REQUEST",
      //       message: `Validation failed: ${errorMessage}`,
      //     });
      //   }
      //   throw error; // Re-throw other errors
      // }
    }),
  // .mutation(async ({ ctx, input }) => {
  //   return ctx.db.transaction(async (tx) => {
  //     try {
  //       // ... validate input, generate IDs, etc.

  //       // Insert the new location
  //       await tx.insert(locations).values({
  //         // ... location values
  //       });

  //       // Insert default loungeSettings for this location
  //       await tx.insert(loungeSettings).values({
  //         locationId: newLocationId,
  //         // ... default settings values
  //       });

  //       return { success: true, id: newLocationId };
  //     } catch (error) {
  //       // Handle errors (e.g., ZodError, TRPCError)
  //       // ...
  //     }
  //   });
  // }),
});
