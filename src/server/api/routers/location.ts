import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { locations, locationSettings, users } from "@/server/db/schema";

import {
  createLocationSchema,
  locationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import { asc, eq } from "drizzle-orm";

export const locationRouter = createTRPCRouter({
  getLocationBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.query.locations.findFirst({
        where: (q) => eq(q.slug, input.slug),
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      return location;
    }),

  // get locationSettings by locationId
  getLocationSettingsByLocationId: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const locationSettings = await ctx.db.query.locationSettings.findFirst({
        where: (q) => eq(q.locationId, input.locationId),
      });

      if (!locationSettings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location settings not found",
        });
      }

      return locationSettings;
    }),

  listBookingsByLocationId: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const bookingsList = await ctx.db.query.bookings.findMany({
        // where: (q) => eq(q.locationId, input.locationId),
        // orderBy: [asc(bookings.startTime)],
        where: (bookings, { eq }) => eq(bookings.locationId, input.locationId),
        orderBy: (bookings, { asc }) => [asc(bookings.startTime)],
      });

      return bookingsList;
    }),

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

          const settings = {
            // Merge default settings with user-provided settings
            timeZone: input.timeZone,
            ...defaultSettings,
          };

          const newLocationSettingsId = uuidv4();

          // Insert default location settings for this location
          await tx.insert(locationSettings).values({
            id: newLocationSettingsId,
            locationId: newLocationId,
            ...settings,
          });

          // Update the onboarded status of the user
          await tx
            .update(users)
            .set({ onboarded: true })
            .where(eq(users.id, userId));

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
    }),
});
