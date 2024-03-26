import type { Metadata } from "next";
import DailyBookings from "@/components/dashboard/DailyBookings";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function DashboardPage() {
  // const { location, locationSettings, resources, isLoading } =
  //   useLocationContext();

  // const location = await api.location.getLocationByUserId.query();

  // if (!location) {
  //   return notFound();
  // }

  // const [locationSettings, resources] = await Promise.all([
  //   api.location.getLocationSettingsByLocationId.query({
  //     locationId: location.id,
  //   }),
  //   api.resource.getResourcesByLocationId.query({ locationId: location.id }),
  // ]);

  // if (isLoading || !location || !locationSettings || !resources) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      {/* <div className="flex-1 space-y-4 p-8 pt-6"> */}
      <div className="grid h-[calc(100vh-68px)] gap-4 overflow-auto md:grid-cols-1 lg:grid-cols-1">
        <Suspense fallback={<div>Loading...</div>}>
          <DailyBookings
          // location={location}
          // locationSettings={locationSettings}
          // resources={resources}
          />
        </Suspense>
      </div>
      {/* </div> */}
    </>
  );
}
