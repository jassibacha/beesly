import { v4 as uuidv4 } from "uuid";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { locations } from "@/server/db/schema";

import { createLocationSchema } from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export const locationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate the input using the Zod schema
        createLocationSchema.parse(input);

        const userId = ctx.auth.userId;
        if (!userId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No user id found in session",
          });
        }

        const newLocationId = uuidv4();
        await ctx.db.insert(locations).values({
          id: newLocationId,
          ownerId: userId,
          name: input.name,
          slug: input.slug,
          phone: input.phone,
          email: input.email,
          country: input.country,
        });
        return { success: true, id: newLocationId };
      } catch (error) {
        if (error instanceof ZodError) {
          // Construct a custom error message from Zod error details
          const errorMessage = error.errors
            .map((e) => `${e.path.join(".")} - ${e.message}`)
            .join("; ");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Validation failed: ${errorMessage}`,
          });
        }
        throw error; // Re-throw other errors
      }
    }),
});
