import * as z from "zod";

// Location schema, used for send booking emails
export const locationSchema = z.object({
  id: z.string().min(1, "Location ID is required."),
  ownerId: z.string().min(1, "Owner ID is required."),
  name: z.string().min(1, "Business name is required."),
  slug: z.string().min(1, "URL slug is required."),
  type: z.string().nullable(),
  phone: z.string().min(1, "Phone number is required.").nullable(),
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required.")
    .nullable(),
  website: z
    .string()
    .url("Invalid URL format")
    .min(1, "Website is required.")
    .nullable(),
  streetAddress: z.string().min(1, "Street address is required.").nullable(),
  city: z.string().min(1, "City is required.").nullable(),
  state: z.string().min(1, "State or province is required.").nullable(),
  zipCode: z.string().min(1, "Zip or postal code is required.").nullable(),
  country: z.string().min(1, "Country is required.").nullable(),
  logo: z.string().url().nullable(),
  timezone: z.string().min(1, "Time zone is required."),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type LocationSchemaValues = z.infer<typeof locationSchema>;

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
  timezone: z.string().min(1, "Time zone is required."),
});
export type CreateLocationSchemaValues = z.infer<typeof createLocationSchema>;

export const updateLocationFormSchema = z.object({
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
  timezone: z.string().optional(),
  logo: z.instanceof(File).or(z.string().url()).optional().nullable(),
  //logo: z.string().url().optional().nullable(),
});
export type UpdateLocationFormSchemaValues = z.infer<
  typeof updateLocationFormSchema
>;

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
  timezone: z.string().optional(),
  logo: z.string().optional().nullable(),
  //logo: z.string().url().optional().nullable(),
});
export type UpdateLocationSchemaValues = z.infer<typeof updateLocationSchema>;

export const dailyAvailabilitySchema = z.record(
  z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  z.object({
    open: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    close: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    isOpen: z.boolean().default(true),
  }),
);

// This is used in: the sendBookingEmail trpc mutation
export const locationSettingsSchema = z.object({
  id: z.string().min(1, "ID is required."),
  locationId: z.string().min(1, "Location ID is required."),
  //timeZone: z.string().min(1, "Time zone is required."),
  // second version
  dailyAvailability: dailyAvailabilitySchema,
  //dailyAvailability: z.object(),
  taxSettings: z.string().min(1, "Tax must be a positive number."),

  // dailyAvailability: dailyAvailabilitySchema,

  // This is a temporary fix for the trpc firing on booking email
  // Realistically we should either modularize the string>object conversion
  // Or we should parse the dailyAvailability string and taxSettings in the trpc
  // That fetches locationSettings in the first place .. look at
  // for more information (Alternatively we just keep this as string since it's unparsed)
  //dailyAvailability: z.string().min(1, "Not empty"),
  //taxSettings: z.string().min(1, "Not empty"),

  // first version
  // dailyAvailability: z.record(
  //   z.string(),
  //   z.object({
  //     open: z
  //       .string()
  //       .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  //     close: z
  //       .string()
  //       .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  //   }),
  // ),
  //taxSettings: z.record(z.string(), z.any()),
  //taxSettings: z.any(),
  initialCostOfBooking: z
    .string()
    .min(1, "Initial cost of booking must be a positive number."),
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
  sameDayLeadTimeBuffer: z
    .number()
    .min(0, "Same day lead time buffer must be 0 or more."),
  bufferTime: z
    .number()
    .min(0, "Buffer time in minutes must be a positive number."),
  timeSlotIncrements: z
    .number()
    .min(0, "Time slot in minutes must be a positive number."),
  displayUnavailableSlots: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type LocationSettingsSchemaValues = z.infer<
  typeof locationSettingsSchema
>;

export const locationSettingsFormSchema = z.object({
  dailyAvailability: dailyAvailabilitySchema,
  taxSettings: z.string().min(0, "Tax must be zero or a positive number."),
  initialCostOfBooking: z
    .string()
    .min(0, "Initial cost of booking must be zero or a positive number."),
  initialBookingLength: z.coerce
    .number()
    .min(1, "Initial booking length must be a positive number."),
  bookingLengthIncrements: z.coerce
    .number()
    .min(1, "Booking length increment must be at least 1."),
  maxAdvanceBookingDays: z.coerce
    .number()
    .min(0, "Maximum advance booking days must be a positive number.")
    .max(365, "Maximum advance booking days must be 365 or less."),
  sameDayLeadTimeBuffer: z.coerce
    .number()
    .min(0, "Same day lead time buffer must be 0 or more."),
  bufferTime: z.coerce
    .number()
    .min(0, "Buffer time in minutes must be a positive number."),
  timeSlotIncrements: z.coerce
    .number()
    .min(0, "Time slot in minutes must be a positive number."),
  displayUnavailableSlots: z.boolean().default(false),
});
export type LocationSettingsFormSchemaValues = z.infer<
  typeof locationSettingsFormSchema
>;

export const updateLocationSettingsSchema = z.object({
  id: z.string().min(1, "ID is required."),
  locationId: z.string().min(1, "Location ID is required."),
  dailyAvailability: dailyAvailabilitySchema,
  //dailyAvailability: z.string().min(1, "Daily availability is required."),
  taxSettings: z.string().min(1, "Tax settings are required."),
  initialCostOfBooking: z
    .string()
    .min(1, "Initial cost of booking is required."),
  initialBookingLength: z
    .number()
    .min(1, "Initial booking length must be at least 1."),
  bookingLengthIncrements: z
    .number()
    .min(1, "Booking length increments must be at least 1."),
  maxAdvanceBookingDays: z
    .number()
    .min(1, "Max advance booking days must be at least 1."),
  sameDayLeadTimeBuffer: z
    .number()
    .min(1, "Same day lead time buffer must be at least 1."),
  bufferTime: z.number().min(1, "Buffer time must be at least 1."),
  timeSlotIncrements: z
    .number()
    .min(1, "Time slot increments must be at least 1."),
  displayUnavailableSlots: z.boolean(),
});
export type UpdateLocationSettingsSchemaValues = z.infer<
  typeof updateLocationSettingsSchema
>;
