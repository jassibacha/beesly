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
  country: z.string(),
});
export type CreateLocationSchemaValues = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(2).max(14).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  // Include fields that are allowed to be updated
});
export type UpdateLocationSchemaValues = z.infer<typeof updateLocationSchema>;
