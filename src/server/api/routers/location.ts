import { v4 as uuidv4 } from "uuid";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  locations,
  locationSettings,
  resources,
  users,
} from "@/server/db/schema";

import {
  createLocationSchema,
  updateLocationSchema,
  locationSettingsSchema,
  locationSettingsFormSchema,
  updateLocationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { Booking, Location, LocationSetting } from "@/server/db/types";
import { colors } from "@/lib/utils";

export const locationRouter = createTRPCRouter({
  getLocationByUserId: protectedProcedure.query(async ({ ctx }) => {
    console.log(
      colors.green + "***** getLocationByUserId firing *****" + colors.reset,
    );
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in to list bookings",
      });
    }

    const location = await ctx.db.query.locations.findFirst({
      where: (locations, { eq }) => eq(locations.ownerId, userId),
    });

    if (!location) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User location not found",
      });
    }

    return location as Location;
  }),
  // Get all locations
  getAllLocations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in to list locations",
      });
    }

    const locations = await ctx.db.query.locations.findMany();

    return locations;
  }),
  getLocationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.query.locations.findFirst({
        where: (q) => eq(q.id, input.id),
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      return location as Location;
    }),

  getLocationBySlug: publicProcedure
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

      return location as Location;
    }),

  // get locationSettings by locationId
  getLocationSettingsByLocationId: publicProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(
        colors.magenta +
          "***** getLocationSettingsByLocationId firing *****" +
          colors.reset,
      );
      const locationSettings = await ctx.db.query.locationSettings.findFirst({
        where: (q) => eq(q.locationId, input.locationId),
      });

      if (!locationSettings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location settings not found",
        });
      }
      return locationSettings as LocationSetting;
    }),

  // This goes in boookings
  // listBookingsByLocationId: protectedProcedure
  //   .input(z.object({ locationId: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const bookingsList = await ctx.db.query.bookings.findMany({
  //       // where: (q) => eq(q.locationId, input.locationId),
  //       // orderBy: [asc(bookings.startTime)],
  //       where: (bookings, { eq }) => eq(bookings.locationId, input.locationId),
  //       orderBy: (bookings, { asc }) => [asc(bookings.startTime)],
  //     });

  //     return bookingsList as Booking[];
  //   }),

  // Create location, which also generates default location settings
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
            timezone: input.timezone,
          });

          // Define default location settings
          const defaultSettings = {
            dailyAvailability: JSON.stringify({
              Monday: { open: "10:00", close: "22:00", isOpen: true },
              Tuesday: { open: "10:00", close: "22:00", isOpen: true },
              Wednesday: { open: "10:00", close: "22:00", isOpen: true },
              Thursday: { open: "10:00", close: "22:00", isOpen: true },
              Friday: { open: "10:00", close: "22:00", isOpen: true },
              Saturday: { open: "10:00", close: "22:00", isOpen: true },
              Sunday: { open: "10:00", close: "22:00", isOpen: true },
            }),
            // taxSettings: {
            //   GST: 5,
            // },
            taxSettings: "12.50",
            initialCostOfBooking: "45.00",
            initialBookingLength: 60,
            bookingLengthIncrements: 30,
            maxAdvanceBookingDays: 60,
            sameDayLeadTimeBuffer: 120,
            //minTimeBetweenBookings: 15,
            bufferTime: 10,
            timeSlotIncrements: 15,
            displayUnavailableSlots: false,
          };

          // const settings = {
          //   // Merge default settings with user-provided settings
          //   timeZone: input.timeZone,
          //   ...defaultSettings,
          // };

          const newLocationSettingsId = uuidv4();

          // Insert default location settings for this location
          await tx.insert(locationSettings).values({
            id: newLocationSettingsId,
            locationId: newLocationId,
            ...defaultSettings,
          });

          const defaultResource = {
            id: uuidv4(),
            locationId: newLocationId,
            type: "VR Booth",
            name: "Booth 1",
            status: "Available",
          };

          // Insert default resource for this location
          await tx.insert(resources).values(defaultResource);

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
  // Update the location
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(), // Include the location ID in the input schema
        ...updateLocationSchema.shape, // Spread the updateLocationSchema shape
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to update a location",
        });
      }
      return ctx.db.transaction(async (tx) => {
        try {
          // Fetch the existing location to ensure it belongs to the current user
          const existingLocation = await tx.query.locations.findFirst({
            where: (locations, { eq }) => eq(locations.id, input.id),
          });

          if (!existingLocation) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Location not found",
            });
          }

          if (existingLocation.ownerId !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "User is not authorized to update this location",
            });
          }

          //console.log("Logo input", input.logo);

          // Update the location
          await tx
            .update(locations)
            .set({
              name: input.name,
              slug: input.slug,
              phone: input.phone,
              email: input.email,
              website: input.website,
              streetAddress: input.streetAddress,
              city: input.city,
              state: input.state,
              zipCode: input.zipCode,
              country: input.country,
              timezone: input.timezone,
              logo: input.logo,
            })
            .where(eq(locations.id, input.id));

          // Update the timeZone in locationSettings (REWORKING)
          // await tx
          //   .update(locationSettings)
          //   .set({
          //     timeZone: input.timeZone,
          //   })
          //   .where(eq(locationSettings.locationId, input.id));

          return { success: true, message: "Location updated successfully" };
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

  // Update the location
  updateSettings: protectedProcedure
    .input(updateLocationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to update a location",
        });
      }
      return ctx.db.transaction(async (tx) => {
        try {
          // Validate the input using the Zod schema
          updateLocationSettingsSchema.parse(input);

          // Fetch the existing location to ensure it belongs to the current user
          const existingLocation = await tx.query.locations.findFirst({
            where: (locations, { eq }) => eq(locations.id, input.locationId),
          });

          if (!existingLocation) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Location not found",
            });
          }

          if (existingLocation.ownerId !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "User is not authorized to update this location",
            });
          }

          //console.log("Logo input", input.logo);

          // Update the location
          // await tx
          //   .update(locations)
          //   .set({
          //     name: input.name,
          //     slug: input.slug,
          //     phone: input.phone,
          //     email: input.email,
          //     website: input.website,
          //     streetAddress: input.streetAddress,
          //     city: input.city,
          //     state: input.state,
          //     zipCode: input.zipCode,
          //     country: input.country,
          //     timezone: input.timezone,
          //     logo: input.logo,
          //   })
          //   .where(eq(locations.id, input.id));

          //Update the timeZone in locationSettings (REWORKING)
          await tx
            .update(locationSettings)
            .set({
              dailyAvailability: input.dailyAvailability,
              taxSettings: input.taxSettings,
              initialCostOfBooking: input.initialCostOfBooking,
              initialBookingLength: input.initialBookingLength,
              bookingLengthIncrements: input.bookingLengthIncrements,
              maxAdvanceBookingDays: input.maxAdvanceBookingDays,
              sameDayLeadTimeBuffer: input.sameDayLeadTimeBuffer,
              bufferTime: input.bufferTime,
              timeSlotIncrements: input.timeSlotIncrements,
              displayUnavailableSlots: input.displayUnavailableSlots,
              updatedAt: input.updatedAt,
            })
            .where(eq(locationSettings.locationId, input.locationId));

          return {
            success: true,
            message: "Location settings updated successfully",
          };
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
