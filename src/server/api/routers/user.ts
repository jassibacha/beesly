import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { currentUser } from "@clerk/nextjs/server";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  // Sync user and return user or null
  syncUser: protectedProcedure.query(async ({ ctx }) => {
    // Get the current Clerk user id, we're using ctx to speed this up
    const clerkUserId = ctx.auth.userId;

    // If no user is logged in, return null
    if (!clerkUserId) {
      return null;
    }

    // Check if user exists in the database
    let user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, clerkUserId),
    });

    // If user doesn't exist, create the user
    if (!user) {
      // Grab the user object from Clerk
      const clerkUser = await currentUser();

      // If the Clerk user object is empty, return null
      if (!clerkUser) {
        return null;
      }

      // Insert the Clerk user into the database
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
