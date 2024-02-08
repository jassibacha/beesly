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
import { TRPCContext } from "@/types/trpcContext";

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

async function getBookingsByDate(
  locationId: string,
  date: Date,
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
  const existingBookings = existingBookingsData.map((booking) => ({
    id: booking.id,
    startTime: DateTime.fromJSDate(booking.startTime).toISO(), // Convert to ISO String
    endTime: DateTime.fromJSDate(booking.endTime).toISO(), // Convert to ISO String
  }));

  return {
    locationSettings,
    openTimeISO,
    closeTimeISO,
    existingBookings,
  };
}
// function generateAllTimeSlots(
//   openTimeISO: string, // The opening time in ISO format
//   closeTimeISO: string, // The closing time in ISO format
//   slotDurationMinutes: number, // Duration of each booking slot in minutes
//   slotIncrementMinutes: number, // Increment between the start times of each slot in minutes
//   bufferTimeMinutes: number, // Buffer time in minutes
//   timezone: string, // The timezone in which the times are specified
// ): ExtendedTimeSlot[] {
//   // Initialize an empty array to hold the generated time slots
//   const slots: ExtendedTimeSlot[] = [];
//   // Convert the opening and closing times from ISO format to DateTime objects using the provided timezone
//   let openTime = DateTime.fromISO(openTimeISO, { zone: timezone });
//   const closeTime = DateTime.fromISO(closeTimeISO, { zone: timezone });

//   // Loop as long as the opening time is less than the closing time
//   while (openTime < closeTime) {
//     // Calculate the end time of the current slot by adding the slot duration to the opening time
//     const endTime = openTime.plus({ minutes: slotDurationMinutes });
//     // If the end time is less than or equal to the closing time, create a new time slot
//     if (endTime <= closeTime) {
//       slots.push({
//         startTime: openTime.toISO()!, // Start time of the slot
//         endTime: endTime.toISO()!, // End time of the slot
//         isAvailable: true, // Default availability status of the slot
//       });
//     }
//     // Increment the opening time by the slot increment to move to the start time of the next slot
//     openTime = openTime.plus({ minutes: slotIncrementMinutes });
//   }
//   // Return the array of generated time slots
//   return slots;
// }

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
        startTime: input.startTime, // TODO: Possibly swap this from JSDate to String once we figure out the Drizzle bug
        endTime: input.endTime, // TODO: Possibly swap this from JSDate to String once we figure out the Drizzle bug
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
        duration: z.string(), // Make duration optional for flexibility
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, date, duration } = input; // Default duration
      console.log("*** getAvailableTimeSlots firing ***");

      const { locationSettings, existingBookings, openTimeISO, closeTimeISO } =
        await getBookingsByDate(locationId, date, ctx);

      // // Fetch location settings to get open and close times
      // const locationSettings = await ctx.db.query.locationSettings.findFirst({
      //   where: (locationSettings, { eq }) =>
      //     eq(locationSettings.locationId, locationId),
      // });

      // if (!locationSettings?.dailyAvailability) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "Location settings not found",
      //   });
      // }

      // if (typeof locationSettings.dailyAvailability !== "string") {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Daily availability settings are not properly configured.",
      //   });
      // }

      // // Initialize a variable to hold parsed daily availability if applicable
      // let dailyAvailability: DailyAvailability | undefined;
      // try {
      //   // Attempt to parse the JSON string into an object
      //   const parsed: unknown = JSON.parse(locationSettings.dailyAvailability);
      //   // Validate the parsed object against the expected structure using isDailyAvailability
      //   if (isDailyAvailability(parsed)) {
      //     console.log("dailyAvailabilityParsed: ", parsed);
      //     // If valid, assign parsed data to dailyAvailability
      //     dailyAvailability = parsed;
      //   } else {
      //     throw new Error(
      //       "Parsed daily availability does not match expected structure.",
      //     );
      //   }
      // } catch (error) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Failed to parse daily availability settings.",
      //   });
      // }

      // const dayOfWeek = DateTime.fromJSDate(date).setZone(
      //   locationSettings.timeZone,
      // ).weekdayLong!;
      // // Extract schedule for the specific day of the week
      // const daySchedule =
      //   dailyAvailability[dayOfWeek as keyof DailyAvailability];

      // const openTimeISO = DateTime.fromISO(
      //   `${DateTime.fromJSDate(date).toISODate()}T${daySchedule.open}`,
      //   { zone: locationSettings.timeZone },
      // ).toISO();
      // const closeTimeISO = DateTime.fromISO(
      //   `${DateTime.fromJSDate(date).toISODate()}T${daySchedule.close}`,
      //   { zone: locationSettings.timeZone },
      // ).toISO();

      // // console.log("Day of week: ", dayOfWeek);
      // // console.log("daySchedule: ", daySchedule);
      // // console.log("OpenTimeISO: ", openTimeISO);
      // // console.log("CloseTimeISO: ", closeTimeISO);

      // // Fetch existing bookings for the selected date within the open/close parameters
      // const existingBookingsData = await ctx.db
      //   .select({
      //     id: bookings.id,
      //     startTime: bookings.startTime,
      //     endTime: bookings.endTime,
      //   })
      //   .from(bookings)
      //   .where(
      //     and(
      //       eq(bookings.locationId, locationId),
      //       gte(bookings.startTime, DateTime.fromISO(openTimeISO!).toJSDate()), // DB stores JS Date
      //       lte(bookings.endTime, DateTime.fromISO(closeTimeISO!).toJSDate()), // DB stores JS Date
      //     ),
      //   )
      //   .orderBy(asc(bookings.startTime));

      // // Convert existing bookings to ISO strings
      // const existingBookings = existingBookingsData.map((booking) => ({
      //   id: booking.id,
      //   startTime: DateTime.fromJSDate(booking.startTime).toISO(), // Convert to ISO String
      //   endTime: DateTime.fromJSDate(booking.endTime).toISO(), // Convert to ISO String
      // }));

      const durationMin = parseFloat(duration) * 60; // Convert hours to minutes if necessary
      // const incrementMin = 15; // Time increment between slots (ie. every 15min)
      // const bufferMin = 5; // Buffer time after each booking
      const incrementMin = locationSettings.timeSlotIncrements; // Time increment between slots (ie. every 15min)
      const bufferMin = locationSettings.bufferTime; // Buffer time after each booking

      // Generate all possible slots
      const allSlots = generateAllTimeSlots(
        openTimeISO!,
        closeTimeISO!,
        durationMin,
        incrementMin,
        bufferMin,
        locationSettings.timeZone,
      );

      // Map over all slots to determine their availability
      const slotsWithAvailability = allSlots.map((slot) => {
        // Convert the start time of the slot from ISO format to DateTime object
        const slotStart = DateTime.fromISO(slot.startTime, {
          zone: locationSettings.timeZone,
        });
        // Convert the end time of the slot from ISO format to DateTime object
        const slotEnd = DateTime.fromISO(slot.endTime, {
          zone: locationSettings.timeZone,
        });
        // Determine if the slot is available by checking if there are any existing bookings that overlap with the slot
        const isAvailable = !existingBookings.some((booking) => {
          // Convert the start time of the booking from ISO format to DateTime object
          // Subtract the buffer time from the start time
          const bookingStart = DateTime.fromISO(booking.startTime!, {
            zone: locationSettings.timeZone,
          }).minus({ minutes: bufferMin });
          // Convert the end time of the booking from ISO format to DateTime object
          // Add the buffer time to the end time
          const bookingEnd = DateTime.fromISO(booking.endTime!, {
            zone: locationSettings.timeZone,
          }).plus({ minutes: bufferMin });
          // Check if the slot and the booking overlap
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });
        // Return a new object that contains all the properties of the original slot, plus the availability information
        return { ...slot, isAvailable };
      });

      // // Create a new array of slots with availability information
      // const slotsWithAvailability = allSlots.map((slot) => {
      //   // Convert the start time of the slot from ISO format to DateTime object
      //   const slotStart = DateTime.fromISO(slot.startTime, {
      //     zone: locationSettings.timeZone,
      //   });
      //   // Convert the end time of the slot from ISO format to DateTime object
      //   const slotEnd = DateTime.fromISO(slot.endTime, {
      //     zone: locationSettings.timeZone,
      //   });
      //   // Determine if the slot is available by checking if there are any existing bookings that overlap with the slot
      //   const isAvailable = !existingBookings.some((booking) => {
      //     // Convert the start time of the booking from ISO format to DateTime object
      //     const bookingStart = DateTime.fromISO(booking.startTime!, {
      //       zone: locationSettings.timeZone,
      //     });
      //     // Convert the end time of the booking from ISO format to DateTime object
      //     const bookingEnd = DateTime.fromISO(booking.endTime!, {
      //       zone: locationSettings.timeZone,
      //     });
      //     // Check if the slot and the booking overlap
      //     return slotStart < bookingEnd && slotEnd > bookingStart;
      //   });
      //   // Return a new object that contains all the properties of the original slot, plus the availability information
      //   return { ...slot, isAvailable };
      // });

      return {
        openTimeISO,
        closeTimeISO,
        slots: slotsWithAvailability,
      };
    }),
});
