import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { auth } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  authCallback: publicProcedure.query(async ({ ctx }) => {
    // Confirm that the user is logged in
    const { userId } = auth();
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Find user in database
    // const dbUser = await db
    //   .select()
    //   .from(users)
    //   .where(eq(users.id, userId))
    //   .execute();

    const dbUser = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    // If user doesn't exist in db, create them
    if (dbUser.length === 0) {
      console.log("Auth Callback: User not found in db, creating...");
      await db.insert(users).values({
        id: userId,
      });
    }

    return { success: true };
  }),
});
