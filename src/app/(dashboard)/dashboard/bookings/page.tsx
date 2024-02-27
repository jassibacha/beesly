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
import BookingsList from "@/components/dashboard/bookings/BookingsList";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default async function BookingsPage() {
  // Check & sync the currentUser to db if they don't exist
  const user = await syncUser();
  if (!user) {
    redirect("/sign-in");
  }

  // If user has not been onboarded, redirect to setup
  // This is handled in middleware but this is one last check
  if (!user.onboarded) {
    redirect("/dashboard/setup");
  }

  const location = await api.location.getLocationByUserId.query();

  if (!location) {
    return notFound();
  }

  const [locationSettings, upcomingBookings, recentBookings] =
    await Promise.all([
      api.location.getLocationSettingsByLocationId.query({
        locationId: location.id,
      }),
      api.booking.listUpcomingBookings.query({
        locationId: location.id,
        limit: 5,
      }),
      api.booking.listRecentBookings.query({
        locationId: location.id,
        limit: 5,
      }),

      // api.resource.getResourcesByLocationId.query({ locationId: location.id }),
    ]);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          {/* <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div> */}
        </div>
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="">
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>
                    There are 10 bookings today.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingsList
                    bookings={upcomingBookings.bookings}
                    timezone={location.timezone}
                  />
                </CardContent>
              </Card>
              <Card className="">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    You have 6 bookings in the past 24h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingsList
                    bookings={recentBookings.bookings}
                    timezone={location.timezone}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="search" className="space-y-4">
            <div className="grid h-screen gap-4 overflow-auto md:grid-cols-1 lg:grid-cols-1">
              Search will go here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
