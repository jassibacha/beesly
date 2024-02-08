import * as z from "zod";

export const createBookingSchema = z.object({
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
