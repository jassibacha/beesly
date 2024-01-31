import * as z from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(2, {
      message: "URL slug must be at least 2 characters.",
    })
    .max(14, {
      message: "URL slug must be 14 characters or less.",
    }),
  phone: z.string(),
  email: z.string().email(),
  // website
  // streetAddress, city, state, postalCode
  country: z.string(),
});
export type CreateLocationSchemaValues = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(2).max(14).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  // website
  // streetAddress, city, state, postalCode
  country: z.string().optional(),
});
export type UpdateLocationSchemaValues = z.infer<typeof updateLocationSchema>;

export const locationSettingsSchema = z.object({
  timeZone: z.string().min(1, "Time zone is required."),
  dailyAvailability: z.record(
    z.string(),
    z.object({
      open: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      close: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    }),
  ),
  taxSettings: z.record(z.string(), z.any()),
  initialCostOfBooking: z
    .number()
    .min(0, "Initial cost of booking must be a positive number."),
  initialBookingLength: z
    .number()
    .min(1, "Initial booking length must be a positive number."),
  bookingLengthIncrements: z
    .number()
    .min(1, "Booking length increment must be at least 1."),
  maxAdvanceBookingDays: z
    .number()
    .min(0, "Maximum advance booking days must be a positive number.")
    .max(365, "Maximum advance booking days must be 365 or less."),
  minTimeBetweenBookings: z
    .number()
    .min(0, "Minimum time between bookings must be a positive number."),
  bufferTimeInMinutes: z
    .number()
    .min(0, "Buffer time in minutes must be a positive number."),
});
export type LocationSettingsSchemaValues = z.infer<
  typeof locationSettingsSchema
>;
