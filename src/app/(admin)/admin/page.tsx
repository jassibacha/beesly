import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { syncUser } from "@/lib/auth/utils";
import { notFound, redirect } from "next/navigation";
import DailyBookings from "@/components/dashboard/DailyBookings";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import { LocationBookings } from "@/components/admin/LocationBookings";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default async function AdminDashboardPage() {
  // MOVED THIS TO ADMIN HEADER SO IT HITS ON EVERY PAGE OF /admin
  // // Check & sync the currentUser to db if they don't exist
  // const user = await syncUser();
  // if (!user) {
  //   redirect("/sign-in");
  // }
  // if (user.id !== process.env.OWNER_ID) {
  //   redirect("/dashboard");
  // }

  const locations = await api.location.getAllLocations.query();

  // Pulling this in at server level
  // const [locations, bookings] = await Promise.all([
  //   api.location.getAllLocations.query(),
  //   api.booking.getAllBookings.query(),
  // ]);

  if (!locations) {
    return notFound();
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="">
          <Suspense fallback={<div>Loading...</div>}>
            <LocationBookings locations={locations} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
