import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createBookingSchema } from "@/lib/schemas/bookingSchemas";
import {
  bookings,
  resourceBookings,
  locations,
  resources,
} from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const bookingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a booking",
        });
      }

      // Use the provided query style for user's location
      const userLocation = await ctx.db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.ownerId, userId),
      });

      if (!userLocation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User location not found",
        });
      }

      // Use the provided query style for the location's resource
      const locationResource = await ctx.db.query.resources.findFirst({
        where: (resources, { eq }) => eq(resources.locationId, userLocation.id),
      });

      if (!locationResource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location resource not found",
        });
      }

      const newBookingId = uuidv4();
      const newResourceBookingId = uuidv4();

      await ctx.db.insert(bookings).values({
        id: newBookingId,
        locationId: userLocation.id,
        startTime: input.startTime,
        endTime: input.endTime,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        // totalCost: input.totalCost,
        // taxAmount: input.taxAmount,
        // status: "Confirmed", // Assuming status
      });

      await ctx.db.insert(resourceBookings).values({
        id: newResourceBookingId,
        bookingId: newBookingId,
        resourceId: locationResource.id,
      });

      return {
        success: true,
        message: "Booking created successfully",
        bookingId: newBookingId,
      };
    }),
  createtemp: publicProcedure.mutation(async ({ ctx, input }) => {
    const userId = process.env.OWNER_ID;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in to create a booking",
      });
    }

    // Use the provided query style for user's location
    const userLocation = await ctx.db.query.locations.findFirst({
      where: (locations, { eq }) => eq(locations.ownerId, userId),
    });

    if (!userLocation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User location not found",
      });
    }

    // Use the provided query style for the location's resource
    const locationResource = await ctx.db.query.resources.findFirst({
      where: (resources, { eq }) => eq(resources.locationId, userLocation.id),
    });

    if (!locationResource) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Location resource not found",
      });
    }

    const newBookingId = uuidv4();
    const newResourceBookingId = uuidv4();

    // Calculate start and end times
    const startTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    const endTime = new Date(new Date().getTime() + 6 * 60 * 60 * 1000); // 6 hours later

    await ctx.db.insert(bookings).values({
      id: newBookingId,
      locationId: userLocation.id,
      startTime: startTime,
      endTime: endTime,
      customerName: "Hardcoded Name",
      customerEmail: "hardcoded@example.com",
      customerPhone: "123-456-7890",
      // totalCost: input.totalCost,
      // taxAmount: input.taxAmount,
      // status: "Confirmed", // Assuming status
    });

    await ctx.db.insert(resourceBookings).values({
      id: newResourceBookingId,
      bookingId: newBookingId,
      resourceId: locationResource.id,
    });

    return {
      success: true,
      message: "Booking created successfully",
      bookingId: newBookingId,
    };
  }),

  // test: publicProcedure
  //   .input(
  //     z.object({
  //       message: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     // Log received input
  //     console.log("Received message:", input.message);
  //     // Echo back the message for debugging
  //     return {
  //       success: true,
  //       message: "Echoing message",
  //       echoedMessage: input.message,
  //     };
  //   }),

  // createSimple: publicProcedure
  //   .input(
  //     z.object({
  //       customerName: z.string().min(1, "Customer name is required."),
  //       customerEmail: z
  //         .string()
  //         .email("Invalid customer email format")
  //         .min(1, "Customer email is required."),
  //       customerPhone: z.string().min(1, "Customer phone is required."),
  //       // Add any additional fields you might need for the booking
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     // Assuming you have a predefined location and resource for the sake of simplicity
  //     const predefinedLocationId = "your-predefined-location-id";
  //     const predefinedResourceId = "your-predefined-resource-id";

  //     const newBookingId = uuidv4();

  //     // Insert a new booking with the customer info and predefined location/resource ids
  //     await ctx.db.insert(bookings).values({
  //       id: newBookingId,
  //       locationId: predefinedLocationId,
  //       customerName: input.customerName,
  //       customerEmail: input.customerEmail,
  //       customerPhone: input.customerPhone,
  //       // Assuming fixed start and end times for simplicity, adjust as needed
  //       startTime: new Date(), // Example start time
  //       endTime: new Date(), // Example end time
  //       // You can set default values for other fields not covered by input
  //       status: "Pending", // Example status
  //     });

  //     // Optionally, link the booking to a resource
  //     await ctx.db.insert(resourceBookings).values({
  //       id: uuidv4(),
  //       bookingId: newBookingId,
  //       resourceId: predefinedResourceId,
  //     });

  //     return {
  //       success: true,
  //       message: "Booking created successfully",
  //       bookingId: newBookingId,
  //     };
  //   }),
});
