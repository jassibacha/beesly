import * as z from "zod";

// Primary booking schema. This should be 1:1 with the Drizzle schema I think?
// used for: booking email sending
export const bookingSchema = z.object({
  id: z.string().min(1, "Booking ID is required."),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  status: z.string().nullable(),
  locationId: z.string().min(1, "Location ID is required."),
  customerName: z.string().min(1, "Customer name is required."),
  customerEmail: z
    .string()
    .email("Invalid customer email format")
    .min(1, "Customer email is required."),
  customerPhone: z.string().min(1, "Customer phone is required."),
  startTime: z.date().min(new Date(), "Start time must be in the future."),
  endTime: z.date().min(new Date(), "End time must be in the future."),
  totalCost: z.string().nullable(),
  taxAmount: z.string().nullable(),
});
export type bookingSchemaValues = z.infer<typeof bookingSchema>;

// Create booking schema, used for: create / book trpc and form
export const createBookingSchema = z.object({
  locationId: z.string().min(1, "Location ID is required."),
  startTime: z.date().min(new Date(), "Start time must be in the future."),
  endTime: z.date().min(new Date(), "End time must be in the future."),
  // startTime: dateOrIsoString,
  // endTime: dateOrIsoString,
  // startTime: z.date(), // For the refinement version
  // endTime: z.date(), // For the refinement version
  customerName: z.string().min(1, "Customer name is required."),
  customerEmail: z
    .string()
    .email("Invalid customer email format")
    .min(1, "Customer email is required."),
  customerPhone: z.string().min(1, "Customer phone is required."),
  // totalCost: z
  //   .number()
  //   .min(0, "Total cost must be a positive number.")
  //   .optional(),
  // taxAmount: z
  //   .number()
  //   .min(0, "Tax amount must be a positive number.")
  //   .optional(),
});

export type CreateBookingSchemaValues = z.infer<typeof createBookingSchema>;

export const createPublicBookingSchema = z.object({
  locationId: z.string().min(1, "Location ID is required."),
  startTime: z.date().min(new Date(), "Start time must be in the future."),
  endTime: z.date().min(new Date(), "End time must be in the future."),
  customerName: z.string().min(1, "Customer name is required."),
  customerEmail: z
    .string()
    .email("Invalid customer email format")
    .min(1, "Customer email is required."),
  customerPhone: z.string().min(1, "Customer phone is required."),
  // Add any other fields that are required for a booking
});

export type CreatePublicBookingSchemaValues = z.infer<
  typeof createPublicBookingSchema
>;

export const bookingFormSchema = z.object({
  date: z.date({
    required_error: "Booking date is required.",
  }),
  duration: z
    .string({
      required_error: "Duration is required.",
    })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Duration must be a number.",
    }),
  timeSlot: z.string({
    required_error: "Time slot selection is required.",
  }), // Could be a string like "10:30 AM", which you would convert to a DateTime object
  customerName: z.string({ required_error: "Name is required." }),
  customerEmail: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address."),
  customerPhone: z.string({ required_error: "Phone is required." }),
});

export type BookingFormSchemaValues = z.infer<typeof bookingFormSchema>;

// Define the schema for updating a booking
export const updateBookingSchema = z.object({
  id: z.string().min(1, "Booking ID is required."),
  locationId: z.string().min(1, "Location ID is required."),
  startTime: z
    .date()
    .min(new Date(), "Start time must be in the future.")
    .optional(),
  endTime: z
    .date()
    .min(new Date(), "End time must be in the future.")
    .optional(),
  customerName: z.string().min(1, "Customer name is required.").optional(),
  customerEmail: z
    .string()
    .email("Invalid customer email format")
    .min(1, "Customer email is required.")
    .optional(),
  customerPhone: z.string().min(1, "Customer phone is required.").optional(),
});

export type UpdateBookingSchemaValues = z.infer<typeof updateBookingSchema>;

// // Adding a separate refinement to ensure endTime is after startTime
// export const createBookingSchemaWithRefinement = createBookingSchema.refine(
//   (data) => data.endTime > data.startTime,
//   {
//     message: "End time must be after start time",
//     // Optional: specifying the path helps Zod understand which part of the object the error relates to
//     path: ["endTime"],
//   },
// );

// export type CreateBookingSchemaValues = z.infer<
//   typeof createBookingSchemaWithRefinement
// >;
