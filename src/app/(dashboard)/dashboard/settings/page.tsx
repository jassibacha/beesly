//"use client";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LocationForm } from "./_components/EditLocationForm";
import { EditLocationSettingsForm } from "./_components/EditLocationSettingsForm";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Settings",
  description: "Example dashboard app built using the components.",
};

export default function Page() {
  // const { location, locationSettings, resources, isLoading } =
  //   useLocationContext();

  // if (isLoading || !location || !locationSettings || !resources) {
  //   return <div>Loading...</div>;
  // }

  // const location = await api.location.getLocationByUserId.query();

  // const locationSettings =
  //   await api.location.getLocationSettingsByLocationId.query({
  //     locationId: location.id,
  //   });

  // // const { location, locationSettings, resources, isLoading, refetchAll } =
  // //   useDashboardData();

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Something Else
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <div className="">
              <Card className="">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <Suspense fallback={<div>Loading...</div>}>
                    <LocationForm
                    // location={location}
                    // locationSettings={locationSettings}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4">
            <div className="">
              <Card className="">
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <Suspense fallback={<div>Loading...</div>}>
                    <EditLocationSettingsForm
                    //locationSettings={locationSettings}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
