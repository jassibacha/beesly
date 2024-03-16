import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { currentUser } from "@clerk/nextjs/server";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  // Sync user and return user or null
  syncUser: publicProcedure.query(async ({ ctx }) => {
    // Get the current Clerk user
    const clerkUser = await currentUser();

    // If no user is logged in, return null
    if (!clerkUser?.id) {
      return null;
    }

    // Check if user exists in the database
    let user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, clerkUser.id),
    });

    // If user doesn't exist, create the user
    if (!user) {
      await ctx.db.insert(users).values({
        id: clerkUser.id,
        username: clerkUser.username ?? "",
        displayName: `${clerkUser.firstName} ${clerkUser.lastName}`,
        userImage: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        onboarded: false,
      });
      // Get the user again to return
      user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, clerkUser.id),
      });
    }

    // Return the user
    return user;
  }),
});
