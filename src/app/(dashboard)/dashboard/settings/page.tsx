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
// import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { api } from "@/trpc/server";
import { LocationForm } from "./_components/EditLocationForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Example dashboard app built using the components.",
};

export default async function Page() {
  const location = await api.location.getLocationByUserId.query();

  const locationSettings =
    await api.location.getLocationSettingsByLocationId.query({
      locationId: location.id,
    });

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <Tabs defaultValue="location" className="space-y-4">
          <TabsList>
            <TabsTrigger value="location">Location Settings</TabsTrigger>
            {/* <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger> */}
            <TabsTrigger value="reports" disabled>
              Account Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Something Else
            </TabsTrigger>
          </TabsList>
          <TabsContent value="location" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Location Settings</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <LocationForm
                    location={location}
                    locationSettings={locationSettings}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
