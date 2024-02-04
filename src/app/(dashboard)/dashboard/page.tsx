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
import { redirect } from "next/navigation";
import DailyBookings from "@/components/dashboard/DailyBookings";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default async function DashboardPage() {
  // Check & sync the currentUser to db if they don't exist
  const user = await syncUser();

  // If user has not been onboarded, redirect to setup
  // This is handled in middleware but this is one last check
  if (!user?.onboarded) {
    redirect("/dashboard/setup");
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue="dayview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dayview">Day View</TabsTrigger>
            {/* <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger> */}
            <TabsTrigger value="reports">Bookings</TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dayview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Daily Bookings</CardTitle>
                  <CardDescription>
                    View all bookings for all stations for the day.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Suspense fallback={<div>Loading...</div>}>
                    <DailyBookings />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="">
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
              <Card className="">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
