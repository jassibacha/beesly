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

    // If user is trying to access a dashboard route
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // Check if user is authenticated
      if (auth.userId) {
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
      } else {
        // User is not authenticated, redirect to sign-in
        console.log("authMiddleware afterAuth redirect to /sign-in");
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    // If user is trying to access an admin route
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Check if user is not the owner
      if (auth.userId !== process.env.OWNER_ID) {
        // Redirect to dashboard if not the owner
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Allow normal processing for all other cases
    return NextResponse.next();
  },
});

// Whatever pages we want matched need to be in matcher below
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/dashboard(.*)",
    "/admin(.*)",
    "/(api|trpc)(.*)",
  ],
};
