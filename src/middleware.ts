import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "./server/db";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ["/", "sign-in", "sign-up", "/api/webhooks/clerk(.*)"],
  afterAuth: async (auth, req) => {
    console.log("authMiddleware afterAuth started");
    // Skip redirect logic if the user is already on the setup page
    if (req.nextUrl.pathname === "/dashboard/setup") {
      return NextResponse.next();
    }

    // Check if user is authenticated and trying to access a dashboard route
    if (auth.userId && req.nextUrl.pathname.startsWith("/dashboard")) {
      console.log("authMiddleware afterAuth auth.userId", auth.userId);
      // Fetch user data to check onboarded status (pseudo-code)
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, auth.userId),
      });

      console.log("authMiddleware afterAuth user onboarded", user?.onboarded);

      // Redirect to onboarding if not onboarded
      if (!user?.onboarded) {
        console.log("authMiddleware afterAuth redirect to /dashboard/setup");
        return NextResponse.redirect(new URL("/dashboard/setup", req.url));
      }
    }

    // Allow normal processing for all other cases
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
