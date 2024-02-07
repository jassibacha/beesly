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
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { DateTime } from "luxon";
import { Booking } from "@/server/db/types";

type DailyAvailability = {
  [day in
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"]: {
    open: string;
    close: string;
  };
};

interface BookingSlot {
  id: string;
  startTime: string; // Assuming ISO string, adjust if it's a Date object
  endTime: string; // Same as above
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const isDailyAvailability = (obj: unknown): obj is DailyAvailability => {
  if (typeof obj !== "object" || obj === null) return false;
  const entries = Object.entries(obj as Record<string, unknown>);
  return entries.every(([day, value]) => {
    if (typeof value !== "object" || value === null) return false;
    const schedule = value as Record<string, unknown>;
    return (
      typeof schedule.open === "string" && typeof schedule.close === "string"
    );
  });
};

// Function to calculate available slots
function calculateAvailableSlots(
  openISO: string, // ISOString
  closeISO: string, // ISOString
  existingBookings: BookingSlot[],
  durationString: string,
  timezone: string,
): TimeSlot[] {
  const duration = parseFloat(durationString); // Convert duration to float
  let currentTime = DateTime.fromISO(openISO, { zone: timezone });
  const closeTime = DateTime.fromISO(closeISO, { zone: timezone });
  const availableSlots = [];

  while (currentTime < closeTime) {
    const endTime = currentTime.plus({ hours: duration });
    // Ensure the slot does not exceed the closing time
    if (endTime <= closeTime) {
      // Check if the slot overlaps with any existing bookings
      const isOverlap = existingBookings.some((booking) => {
        const bookingStart = DateTime.fromISO(booking.startTime, {
          zone: timezone,
        });
        const bookingEnd = DateTime.fromISO(booking.endTime, {
          zone: timezone,
        });
        return currentTime < bookingEnd && endTime > bookingStart;
      });

      // If no overlap, add the slot to available slots
      if (!isOverlap) {
        availableSlots.push({
          startTime: currentTime.toISO() ?? "", // Fallback to empty string if null
          endTime: endTime.toISO() ?? "", // Fallback to empty string if null
        });
      }
    }
    // Move to the next potential slot
    currentTime = endTime;
  }

  return availableSlots;
}

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
    const nowPlus2Hours = DateTime.now().setZone("utc").plus({ hours: 2 });
    const roundedStartTime = nowPlus2Hours
      .plus({
        minutes: (15 - (nowPlus2Hours.minute % 15)) % 15,
      })
      .startOf("minute");
    const startTime = roundedStartTime.toJSDate();
    const endTime = roundedStartTime
      .plus({ hours: 2 })
      .startOf("minute")
      .toJSDate();
    // const startTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    // const endTime = new Date(new Date().getTime() + 6 * 60 * 60 * 1000); // 6 hours later

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
  listBookings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in to list bookings",
      });
    }

    const userLocation = await ctx.db.query.locations.findFirst({
      where: (locations, { eq }) => eq(locations.ownerId, userId),
    });

    if (!userLocation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User location not found",
      });
    }

    // Fetch bookings associated with the user's location
    const userBookings = await ctx.db.query.bookings.findMany({
      where: (bookings, { eq }) => eq(bookings.locationId, userLocation.id),
      orderBy: [asc(bookings.startTime)], // Assuming you want to order them by the start time
    });

    return {
      success: true,
      bookings: userBookings,
    };
  }),
  listBookingsByLocation: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Retrieve userId from context
      const userId = ctx.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in",
        });
      }

      const { locationId } = input;

      // Fetch the location to verify ownership
      const userLocation = await ctx.db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.id, locationId),
      });

      // Verify that the location belongs to the current user
      if (!userLocation || userLocation.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to view bookings for this location",
        });
      }

      // Fetch bookings associated with the verified locationId
      const userBookings = await ctx.db.query.bookings.findMany({
        where: (bookings, { eq }) => eq(bookings.locationId, locationId),
        orderBy: [asc(bookings.startTime)], // Order by the start time in ascending order
      });

      return {
        success: true,
        locationid: locationId,
        bookings: userBookings,
      };
    }),
  getAvailableTimeSlots: publicProcedure
    .input(
      z.object({
        locationId: z.string(),
        date: z.date(),
        duration: z.string().optional(), // Make duration optional for flexibility
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, date, duration } = input;
      console.log("*** getAvailableTimeSlots firing ***");

      // Fetch location settings to get open and close times
      const locationSettings = await ctx.db.query.locationSettings.findFirst({
        where: (locationSettings, { eq }) =>
          eq(locationSettings.locationId, locationId),
      });

      if (!locationSettings?.dailyAvailability) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location settings not found",
        });
      }

      if (typeof locationSettings.dailyAvailability !== "string") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Daily availability settings are not properly configured.",
        });
      }

      // Initialize a variable to hold parsed daily availability if applicable
      let dailyAvailability: DailyAvailability | undefined;
      try {
        // Attempt to parse the JSON string into an object
        const parsed: unknown = JSON.parse(locationSettings.dailyAvailability);
        // Validate the parsed object against the expected structure using isDailyAvailability
        if (isDailyAvailability(parsed)) {
          console.log("dailyAvailabilityParsed: ", parsed);
          // If valid, assign parsed data to dailyAvailability
          dailyAvailability = parsed;
        } else {
          throw new Error(
            "Parsed daily availability does not match expected structure.",
          );
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse daily availability settings.",
        });
      }

      const dayOfWeek = DateTime.fromJSDate(date).setZone(
        locationSettings.timeZone,
      ).weekdayLong!;

      // Adjust the provided date to the timezone specified in locationSettings
      // This is crucial for ensuring that any date-related operations are performed
      // in the context of the location's local timezone, such as determining the day of the week
      // or comparing against business hours defined in local time.
      const tzDate = DateTime.fromJSDate(date).setZone(
        locationSettings?.timeZone,
      );
      // Extract schedule for the specific day of the week
      const daySchedule =
        dailyAvailability[dayOfWeek as keyof DailyAvailability];

      // Convert opening time to UTC: Combine the date with opening time, apply location's timezone, then convert to UTC
      const openTime = DateTime.fromISO(
        `${tzDate.toISODate()}T${daySchedule.open}`,
        {
          zone: locationSettings.timeZone,
        },
      ).toUTC();

      // Convert closing time to UTC: Same process as opening time, but for closing
      const closeTime = DateTime.fromISO(
        `${tzDate.toISODate()}T${daySchedule.close}`,
        {
          zone: locationSettings.timeZone,
        },
      ).toUTC();

      // Directly create ISO strings for open and close times
      const openTimeISO = DateTime.fromISO(
        `${tzDate.toISODate()}T${daySchedule.open}`,
        { zone: locationSettings.timeZone },
      )
        .toUTC()
        .toISO();
      const closeTimeISO = DateTime.fromISO(
        `${tzDate.toISODate()}T${daySchedule.close}`,
        { zone: locationSettings.timeZone },
      )
        .toUTC()
        .toISO();

      console.log("Day of week: ", dayOfWeek);
      console.log("daySchedule: ", daySchedule);
      console.log("tzDate: ", tzDate.toISO());
      console.log("Open Time in UTC: ", openTimeISO);
      console.log("Close Time in UTC: ", closeTimeISO);

      //const { open, close } = dailyAvailability[dayOfWeek];

      // Fetch existing bookings for the selected date within the open/close parameters
      const existingBookingsData = await ctx.db
        .select({
          id: bookings.id,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.locationId, locationId),
            gte(bookings.startTime, DateTime.fromISO(openTimeISO!).toJSDate()),
            lte(bookings.endTime, DateTime.fromISO(closeTimeISO!).toJSDate()),
          ),
        )
        .orderBy(asc(bookings.startTime));

      // Convert existing bookings to ISO strings
      const existingBookings = existingBookingsData.map((booking) => ({
        id: booking.id,
        startTime: DateTime.fromJSDate(booking.startTime).toISO(), // Convert to ISO String
        endTime: DateTime.fromJSDate(booking.endTime).toISO(), // Convert to ISO String
      }));

      let availableSlots: TimeSlot[] = [];
      if (duration) {
        // Calculate available slots based on duration and existing bookings
        // This logic would involve iterating over potential start times within open-close range
        // and checking against existing bookings to find slots where the duration fits
        //availableSlots = calculateAvailableSlots(openTime, closeTime, existingBookings, duration, timezone);
        availableSlots = calculateAvailableSlots(
          openTime.toISO()!,
          closeTime.toISO()!,
          existingBookings.map((booking) => ({
            id: booking.id,
            startTime: booking.startTime!, // Ensure these are ISO strings
            endTime: booking.endTime!,
          })),
          duration,
          locationSettings.timeZone, // Pass the location's timezone
        );
      }

      console.log("Existing Bookings: ", existingBookings);
      console.log("Available Slots: ", availableSlots);

      return {
        openTimeISO,
        closeTimeISO,
        existingBookings,
        availableSlots,
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
