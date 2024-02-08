import * as z from "zod";

export const createLocationSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter a business name.")
    .max(256, "Business name must be less than 256 characters."),
  slug: z
    .string()
    .min(2, "URL slug must be at least 2 characters long.")
    .max(50, "URL slug must be no more than 50 characters."),
  phone: z
    .string()
    .min(1, "Please provide a phone number.")
    .max(30, "Phone number must be less than 30 characters."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required.")
    .max(100, "Email must be less than 100 characters."),
  website: z
    .string()
    .url("Please enter a valid URL (e.g., https://www.example.com).")
    .max(256, "Website URL must be less than 256 characters."),
  streetAddress: z
    .string()
    .min(1, "Street address is required.")
    .max(256, "Street address must be less than 256 characters."),
  city: z
    .string()
    .min(1, "Please enter the city name.")
    .max(100, "City name must be less than 100 characters."),
  state: z
    .string()
    .min(1, "State or province is required.")
    .max(20, "State or province must be less than 30 characters."),
  zipCode: z
    .string()
    .min(1, "Zip or postal code is required.")
    .max(20, "Zip or postal code must be less than 20 characters."),
  country: z
    .string()
    .min(1, "Country selection is required.")
    .max(100, "Country name must be less than 100 characters."),
  timeZone: z.string().min(1, "Time zone is required."),
});
export type CreateLocationSchemaValues = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(2).max(14).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  timeZone: z.string().optional(),
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
  bufferTime: z
    .number()
    .min(0, "Buffer time in minutes must be a positive number."),
  timeSlotIncrements: z
    .number()
    .min(0, "Time slot in minutes must be a positive number."),
});
export type LocationSettingsSchemaValues = z.infer<
  typeof locationSettingsSchema
>;
