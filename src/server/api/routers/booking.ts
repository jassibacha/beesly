import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  createBookingSchema,
  createPublicBookingSchema,
  updateBookingSchema,
} from "@/lib/schemas/bookingSchemas";
import {
  bookings,
  resourceBookings,
  locations,
  resources,
} from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { DateTime } from "luxon";
import { Booking } from "@/server/db/types";
import type { TRPCContext } from "@/types/trpcContext";

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
  startTime: string; // We work with ISO strings and store as JSDate for now
  endTime: string; // Same as above
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ExtendedTimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Checks if the provided object is a valid DailyAvailability.
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a valid DailyAvailability.
 */
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

/**
 * Generates an array of time slots based on the provided parameters.
 * Each time slot represents a period of time within the specified open and close times.
 * @param openTimeISO - The ISO string representing the opening time.
 * @param closeTimeISO - The ISO string representing the closing time.
 * @param slotDurationMinutes - The duration of each time slot in minutes.
 * @param slotIncrementMinutes - The increment value for generating consecutive time slots in minutes.
 * @param bufferTimeMinutes - The buffer time to be subtracted from the end time of each time slot in minutes.
 * @param timezone - The timezone in which the time slots should be generated.
 * @returns An array of ExtendedTimeSlot objects representing the generated time slots.
 */
function generateAllTimeSlots(
  openTimeISO: string, // The opening time in ISO format
  closeTimeISO: string, // The closing time in ISO format
  slotDurationMinutes: number, // The duration of each slot in minutes
  slotIncrementMinutes: number, // The time increment between each slot in minutes
  bufferTimeMinutes: number, // The buffer time in minutes
  timezone: string, // The timezone of the location
): ExtendedTimeSlot[] {
  // Initialize an empty array to store the slots
  const slots: ExtendedTimeSlot[] = [];
  // Convert the opening time from ISO format to DateTime object
  let openTime = DateTime.fromISO(openTimeISO, { zone: timezone });
  // Convert the closing time from ISO format to DateTime object
  const closeTime = DateTime.fromISO(closeTimeISO, { zone: timezone });
  // Loop until the opening time is less than the closing time
  while (openTime < closeTime) {
    // Calculate the end time of each slot by adding the slot duration and buffer time to the opening time
    const endTime = openTime.plus({
      minutes: slotDurationMinutes + bufferTimeMinutes,
    });
    // If the end time is less than or equal to the closing time, add the slot to the array
    if (endTime <= closeTime) {
      slots.push({
        startTime: openTime.toISO()!, // The start time of the slot in ISO format
        endTime: endTime.toISO()!, // The end time of the slot in ISO format
        isAvailable: true, // The availability status of the slot
      });
    }
    // Increment the opening time by the slot increment
    openTime = openTime.plus({ minutes: slotIncrementMinutes });
  }
  // Return the array of slots
  return slots;
}

enum BookingDetail {
  Basic, // id, startTime, endTime
  Full, // Everything!
}

async function getBookingsByDate(
  locationId: string,
  date: Date,
  detailLevel: BookingDetail,
  ctx: TRPCContext,
) {
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
  // Extract schedule for the specific day of the week
  const daySchedule = dailyAvailability[dayOfWeek as keyof DailyAvailability];

  const openTimeISO = DateTime.fromISO(
    `${DateTime.fromJSDate(date).toISODate()}T${daySchedule.open}`,
    { zone: locationSettings.timeZone },
  ).toISO();
  const closeTimeISO = DateTime.fromISO(
    `${DateTime.fromJSDate(date).toISODate()}T${daySchedule.close}`,
    { zone: locationSettings.timeZone },
  ).toISO();

  // console.log("Day of week: ", dayOfWeek);
  // console.log("daySchedule: ", daySchedule);
  // console.log("OpenTimeISO: ", openTimeISO);
  // console.log("CloseTimeISO: ", closeTimeISO);

  let existingBookings;
  if (detailLevel === BookingDetail.Basic) {
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
          gte(bookings.startTime, DateTime.fromISO(openTimeISO!).toJSDate()), // DB stores JS Date
          lte(bookings.endTime, DateTime.fromISO(closeTimeISO!).toJSDate()), // DB stores JS Date
        ),
      )
      .orderBy(asc(bookings.startTime));

    // Convert existing bookings to ISO strings
    existingBookings = existingBookingsData.map((booking) => ({
      id: booking.id,
      startTime: DateTime.fromJSDate(booking.startTime).toISO(), // Convert to ISO String
      endTime: DateTime.fromJSDate(booking.endTime).toISO(), // Convert to ISO String
    }));
  } else if (detailLevel === BookingDetail.Full) {
    // Fetch existing bookings for the selected date within the open/close parameters
    const existingBookingsData = await ctx.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.locationId, locationId),
          gte(bookings.startTime, DateTime.fromISO(openTimeISO!).toJSDate()), // DB stores JS Date
          lte(bookings.endTime, DateTime.fromISO(closeTimeISO!).toJSDate()), // DB stores JS Date
        ),
      )
      .orderBy(asc(bookings.startTime));

    // Convert existing bookings to ISO strings
    existingBookings = existingBookingsData.map((booking) => ({
      locationId: booking.locationId,
      id: booking.id,
      startTime: DateTime.fromJSDate(booking.startTime).toISO(), // Convert to ISO String
      endTime: DateTime.fromJSDate(booking.endTime).toISO(), // Convert to ISO String
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
    }));
  }

  return {
    locationSettings,
    openTimeISO,
    closeTimeISO,
    existingBookings,
  };
}

interface BookingInput {
  locationId: string;
  startTime: Date;
  endTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface BookingCreationResult {
  success: boolean;
  bookingId?: string;
  message?: string;
}

async function createBooking(
  locationId: string,
  input: BookingInput,
  ctx: TRPCContext,
): Promise<BookingCreationResult> {
  const { startTime, endTime, customerName, customerEmail, customerPhone } =
    input;

  // Fetch the location to ensure it exists and to obtain any necessary location-specific information
  const location = await ctx.db.query.locations.findFirst({
    where: (locations, { eq }) => eq(locations.id, locationId),
  });

  if (!location) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Location not found",
    });
  }

  // Use the provided query style for the location's resource
  const locationResource = await ctx.db.query.resources.findFirst({
    where: (resources, { eq }) => eq(resources.locationId, locationId),
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
    locationId: locationId,
    startTime: startTime, // TODO: Possibly swap this from JSDate to String once we figure out the Drizzle bug
    endTime: endTime, // TODO: Possibly swap this from JSDate to String once we figure out the Drizzle bug
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
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
}

export const bookingRouter = createTRPCRouter({
  // Create, back-end creation of a booking for dashboard
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

      const result = await createBooking(input.locationId, input, ctx);

      if (result.success) {
        return {
          success: true,
          message: "Booking successfully created in dashboard",
          bookingId: result.bookingId,
        };
      }
    }),
  // New public create booking route
  book: publicProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      // Directly use input.locationId for booking creation
      const result = await createBooking(input.locationId, input, ctx);

      if (result.success) {
        return {
          success: true,
          message: "Public booking successfully created",
          bookingId: result.bookingId,
        };
      }
    }),

  // Update: Dashboard Route
  update: protectedProcedure
    .input(updateBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Fetch the booking to ensure it exists
      const booking = await ctx.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, id),
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Update the booking with the provided data
      await ctx.db.update(bookings).set(updateData).where(eq(bookings.id, id));

      // Return the updated booking
      return {
        success: true,
        message: "Booking updated successfully",
        id,
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
  listBookingsByDate: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        date: z.date(),
        //duration: z.string(), // Make duration optional for flexibility
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, date } = input; // Default duration
      console.log("*** getAvailableTimeSlots firing ***");

      const { locationSettings, existingBookings, openTimeISO, closeTimeISO } =
        await getBookingsByDate(locationId, date, BookingDetail.Full, ctx);

      //const durationMin = parseFloat(duration) * 60; // Convert hours to minutes if necessary
      const incrementMin = locationSettings.timeSlotIncrements; // Time increment between slots (ie. every 15min)
      const bufferMin = locationSettings.bufferTime; // Buffer time after each booking

      return {
        openTimeISO,
        closeTimeISO,
        bookings: existingBookings,
      };
    }),
  getAvailableTimeSlots: publicProcedure
    .input(
      z.object({
        locationId: z.string(),
        date: z.date(),
        duration: z.string(),
        //includeAllSlots: z.boolean().optional(),
        bookingId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, date, duration, bookingId } = input; // Default duration
      console.log("*** getAvailableTimeSlots firing ***");

      // const { locationSettings, existingBookings, openTimeISO, closeTimeISO } =
      //   await getBookingsByDate(locationId, date, BookingDetail.Basic, ctx);

      const bookingsByDate = await getBookingsByDate(
        locationId,
        date,
        BookingDetail.Basic,
        ctx,
      );

      const { locationSettings, openTimeISO, closeTimeISO } = bookingsByDate;
      let { existingBookings } = bookingsByDate;

      const tz = locationSettings.timeZone; // Shortened timezone
      const durationMin = parseFloat(duration) * 60; // Convert hours to minutes if necessary
      const incrementMin = locationSettings.timeSlotIncrements; // Time increment between slots (ie. every 15min)
      const bufferMin = locationSettings.bufferTime; // Buffer time after each booking

      // Adjust for same-day booking lead time
      const now = DateTime.now().setZone(tz);
      const selectedDate = DateTime.fromJSDate(date).setZone(tz);
      let adjustedOpenTimeISO = openTimeISO;

      // If booking date is today, adjust the start time considering the lead time buffer
      if (selectedDate.hasSame(now, "day")) {
        const leadTimeBuffer = locationSettings.sameDayLeadTimeBuffer || 0;
        let earliestStartTime = now.plus({ minutes: leadTimeBuffer });

        // Align earliest start time with the next slot increment
        // Calculate the minutes to add to reach the next slot increment
        const minutesToAdd =
          incrementMin - (earliestStartTime.minute % incrementMin);
        earliestStartTime = earliestStartTime.plus({ minutes: minutesToAdd });
        // Adjust the open time if the earliest start time is later than the initial open time
        if (earliestStartTime > DateTime.fromISO(openTimeISO!, { zone: tz })) {
          //adjustedOpenTime = earliestStartTime;
          // If the earliest start time after adding the buffer is later than the open time, adjust the open time
          adjustedOpenTimeISO = earliestStartTime.toISO();
        }
      }
      console.log("leadTimeBuffer: ", locationSettings.sameDayLeadTimeBuffer);

      // Generate all possible slots
      const allSlots = generateAllTimeSlots(
        adjustedOpenTimeISO!,
        closeTimeISO!,
        durationMin,
        incrementMin,
        bufferMin,
        tz,
      );

      if (!allSlots) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate time slots.",
        });
      }

      if (!existingBookings) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch existing bookings.",
        });
      }

      // If a bookingId is provided, filter out the existing booking with the same ID
      // So that we can see those timeslots available when editing that booking
      if (bookingId) {
        existingBookings = existingBookings.filter(
          (booking) => booking.id !== bookingId,
        );
      }

      let finalSlots = allSlots.map((slot) => {
        // Convert the start and end times of the slot from ISO string to DateTime in the specified timezone
        const slotStart = DateTime.fromISO(slot.startTime, { zone: tz });
        const slotEnd = DateTime.fromISO(slot.endTime, { zone: tz });

        // Determine if the slot overlaps with any existing bookings, considering buffer time
        const isAvailable = !existingBookings!.some((booking) => {
          const bookingStart = DateTime.fromISO(booking.startTime!, {
            zone: tz,
          }).minus({ minutes: bufferMin });
          const bookingEnd = DateTime.fromISO(booking.endTime!, {
            zone: tz,
          }).plus({ minutes: bufferMin });
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        // If booking for today, ensure the slot start time is in the future
        const isFuture = !selectedDate.hasSame(now, "day") || slotStart > now;

        return { ...slot, isAvailable: isAvailable && isFuture };
      });

      // If the location setting specifies not to display unavailable slots, or if a bookingId is provided,
      if (!locationSettings.displayUnavailableSlots && !bookingId) {
        //if (!locationSettings.displayUnavailableSlots && !includeAllSlots) {
        finalSlots = finalSlots.filter((slot) => slot.isAvailable);
      }

      // let finalSlots = allSlots;
      // console.log("finalSlots: ", finalSlots);

      // If the location setting specifies not to display unavailable slots, or if includeAllSlots is false,
      // if (!locationSettings.displayUnavailableSlots || !includeAllSlots) {
      //   console.log(
      //     `displayUnavailableSlots: ${locationSettings.displayUnavailableSlots} - includeAllSlots: ${includeAllSlots}`,
      //   );
      //   console.log("filtering slots");
      //   // Filter slots based on availability and additional constraints for same-day bookings
      //   finalSlots = allSlots.filter((slot) => {
      //     // Convert the start and end times of the slot from ISO string to DateTime in the specified timezone
      //     const slotStart = DateTime.fromISO(slot.startTime, {
      //       zone: tz,
      //     });
      //     const slotEnd = DateTime.fromISO(slot.endTime, {
      //       zone: tz,
      //     });

      //     // Determine if the slot overlaps with any existing bookings, considering buffer time
      //     const isAvailable = !existingBookings.some((booking) => {
      //       // Subtract the buffer time from the booking's start time and add it to the end time
      //       // to ensure there's no overlap with the current slot considering the buffer
      //       const bookingStart = DateTime.fromISO(booking.startTime!, {
      //         zone: tz,
      //       }).minus({ minutes: bufferMin });
      //       const bookingEnd = DateTime.fromISO(booking.endTime!, {
      //         zone: tz,
      //       }).plus({ minutes: bufferMin });

      //       // A slot is unavailable if it overlaps with any existing booking
      //       return slotStart < bookingEnd && slotEnd > bookingStart;
      //     });

      //     // If booking for today, ensure the slot start time is in the future
      //     // This takes into account the same-day lead time buffer implicitly by only showing future slots
      //     return (
      //       isAvailable &&
      //       (!selectedDate.hasSame(now, "day") || slotStart > now)
      //     );
      //   });
      // }

      // // If the location setting specifies not to display unavailable slots,
      // // filter the finalSlots array to only include slots where isAvailable is true
      // if (!locationSettings.displayUnavailableSlots) {
      //   finalSlots = finalSlots.filter((slot) => slot.isAvailable);
      // }

      // If the location setting specifies not to display unavailable slots, or if includeAllSlots is false,
      // filter the finalSlots array to only include slots where isAvailable is true
      // if (!locationSettings.displayUnavailableSlots) {
      //   console.log("filtering slots");
      //   finalSlots = finalSlots.filter((slot) => slot.isAvailable);
      // }

      //console.log(finalSlots);

      return {
        openTimeISO,
        closeTimeISO,
        slots: finalSlots,
      };
    }),

  // Upcoming bookings
  listUpcomingBookings: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit = 10, locationId } = input; // Default limit to 10 if not provided
      const now = new Date();

      const upcomingBookings2 = await ctx.db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.locationId, locationId),
            gte(bookings.startTime, now), // DB stores JS Date
            //lte(bookings.endTime, DateTime.fromISO(closeTimeISO!).toJSDate()), // DB stores JS Date
          ),
        )
        .orderBy(asc(bookings.startTime))
        .limit(limit);

      // const upcomingBookings = await ctx.db.query.bookings.findMany({
      //   where: (bookings, { gte }) => gte(bookings.startTime, now),
      //   orderBy: [asc(bookings.startTime)],
      //   limit,
      // });

      return {
        bookings: upcomingBookings2,
      };
    }),

  // Recent bookings
  listRecentBookings: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit = 10 } = input; // Default limit to 10 if not provided

      const recentBookings = await ctx.db.query.bookings.findMany({
        orderBy: [desc(bookings.createdAt)],
        limit,
      });

      return {
        bookings: recentBookings,
      };
    }),

  // Search bookings
  searchBookings: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        // Add more fields if needed
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;

      const matchingBookings = await ctx.db.query.bookings.findMany({
        where: (bookings, { or, like }) =>
          or(
            like(bookings.customerName, `%${query}%`),
            like(bookings.customerEmail, `%${query}%`),
            like(bookings.customerPhone, `%${query}%`),
          ),
        // Add more conditions if needed
      });

      return {
        bookings: matchingBookings,
      };
    }),

  // Get booking by ID
  getBookingById: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { bookingId } = input;

      const booking = await ctx.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, bookingId),
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      return booking;
    }),
});
