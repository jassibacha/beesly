import { v4 as uuidv4 } from "uuid";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
//import { locations, locationSettings, users } from "@/server/db/schema";

// import {
//   createLocationSchema,
//   locationSettingsSchema,
// } from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { Resource } from "@/server/db/types";
import { colors } from "@/lib/utils";

export const resourceRouter = createTRPCRouter({
  // get resource by locationId
  getResourcesByLocationId: publicProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(
        colors.cyan +
          "***** getResourcesByLocationId firing *****" +
          colors.reset,
      );
      const resources = await ctx.db.query.resources.findMany({
        where: (q) => eq(q.locationId, input.locationId),
      });

      if (!resources) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      return resources as Resource[];
    }),
});
