import { createTRPCRouter } from "@/server/api/trpc";
import { locationRouter } from "@/server/api/routers/location";
import { bookingRouter } from "@/server/api/routers/booking";
import { resourceRouter } from "@/server/api/routers/resource";
import { emailRouter } from "@/server/api/routers/email";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  location: locationRouter,
  booking: bookingRouter,
  resource: resourceRouter,
  email: emailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
