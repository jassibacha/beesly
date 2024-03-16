"use client";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { MainNav } from "./main-nav";
import { ModeToggle } from "./mode-toggle";
import { Search } from "./search";
import TeamSwitcher from "./team-switcher";
import { UserNav } from "./user-nav";
import Link from "next/link";
import { NewBookingDialog } from "./bookings/NewBookingDialog";
import { NewBooking } from "./bookings/NewBooking";
import { syncUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { UserContext, useDashboardUser } from "@/context/UserContext";
import { Suspense, useContext } from "react";
import { Skeleton } from "../ui/skeleton";

export default function Header() {
  // // Check & sync the currentUser to db if they don't exist - SERVER SIDE
  // const user = await syncUser();

  const { user, isLoading } = useDashboardUser();

  // // If these next two if statements are uncommented, we redirect even when logged in right now
  // // I assume because useDashboardUser is not yet loaded. This is a problem.
  // if (!user) {
  //   redirect("/sign-in");
  // }

  // // If user has not been onboarded, redirect to setup
  // // This is handled in middleware but this is one last check
  // if (!user?.onboarded) {
  //   redirect("/dashboard/setup");
  // }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          {/* <Search /> */}
          {isLoading ? (
            // Show skeletons while loading
            <>
              <Skeleton className="h-8 w-32 rounded-md md:hidden" />
              <div className="hidden md:block">
                <Skeleton className="h-8 w-32 rounded-md" />
              </div>
            </>
          ) : user?.onboarded === false ? (
            // Show disabled button when user is not onboarded
            <>
              <Button
                variant="default"
                size="sm"
                disabled
                className="md:hidden"
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                New
              </Button>
              <div className="hidden md:block">
                <Button variant="default" size="sm" disabled>
                  <PlusCircle className="mr-1 h-4 w-4" />
                  New Booking
                </Button>
              </div>
            </>
          ) : (
            // Show actual components when data is available
            <>
              <Button variant="default" size="sm" asChild className="md:hidden">
                <Link
                  href="/dashboard/bookings/new"
                  className="flex items-center"
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  New
                </Link>
              </Button>
              <div className="hidden md:block">
                <NewBookingDialog />
              </div>
            </>
          )}

          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <UserNav />
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

//export default Header;
