import * as z from "zod";

// Custom transformer to handle both Date objects and ISO string dates
const dateOrIsoString = z.union([z.date(), z.string()]).transform((val) => {
  if (typeof val === "string") {
    const parsedDate = new Date(val);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    return parsedDate;
  }
  return val; // If it's already a Date object, just return it
});

export const createBookingSchema = z.object({
  startTime: dateOrIsoString,
  endTime: dateOrIsoString,
  // startTime: z.string().or(z.date()),
  // endTime: z.string().or(z.date()),
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
