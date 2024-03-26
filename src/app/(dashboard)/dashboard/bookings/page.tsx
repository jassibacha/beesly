//"use client";
import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { notFound, redirect } from "next/navigation";
import DailyBookings from "@/components/dashboard/DailyBookings";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import BookingsList from "@/components/dashboard/bookings/BookingsList";
import { useLocationContext } from "@/context/LocationContext";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function BookingsPage() {
  // const { location, locationSettings, resources, isLoading } =
  //   useLocationContext();

  // if (isLoading || !location || !locationSettings || !resources) {
  //   return <div>Loading...</div>;
  //}

  // const location = await api.location.getLocationByUserId.query();

  // if (!location) {
  //   return notFound();
  // }

  // const [locationSettings, resources, upcomingBookings, recentBookings] =
  //   await Promise.all([
  //     api.location.getLocationSettingsByLocationId.query({
  //       locationId: location.id,
  //     }),
  //     api.resource.getResourcesByLocationId.query({ locationId: location.id }),
  //     api.booking.listUpcomingBookings.query({
  //       locationId: location.id,
  //       limit: 5,
  //     }),
  //     api.booking.listRecentBookings.query({
  //       locationId: location.id,
  //       limit: 5,
  //     }),

  //     // api.resource.getResourcesByLocationId.query({ locationId: location.id }),
  //   ]);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        </div>
        {/* <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="space-y-4"> */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
          <Suspense fallback={<div>Loading...</div>}>
            <BookingsList
              // bookings={upcomingBookings.bookings}
              type="upcoming"
              // timezone={location.timezone}
              // location={location}
              // locationSettings={locationSettings}
              // resources={resources}
            />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <BookingsList
              // bookings={recentBookings.bookings}
              type="recent"
              // timezone={location.timezone}
              // location={location}
              // locationSettings={locationSettings}
              // resources={resources}
            />
          </Suspense>
        </div>
        {/* </TabsContent>
          <TabsContent value="search" className="space-y-4">
            <div className="grid h-screen gap-4 overflow-auto md:grid-cols-1 lg:grid-cols-1">
              Search will go here
            </div>
          </TabsContent>
        </Tabs> */}
      </div>
    </>
  );
}
