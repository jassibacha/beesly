// "use client";
import { notFound, redirect } from "next/navigation";

import { api } from "@/trpc/server";
//import { BookingPage } from "./_components/BookingPage";
import { type Metadata, type ResolvingMetadata } from "next/types";
import { Suspense, useContext } from "react";
import { TimezoneContext } from "@/context/TimezoneContext";
import { syncUser } from "@/lib/auth/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingForm } from "@/components/forms/BookingForm";

// type Props = {
//   params: {
//     id: string;
//   };
// };

// REMOVE: Referenced from SL event/[eventid]/page.tsx

// export async function generateMetadata(
//   { params }: Props,
//   parent: ResolvingMetadata,
// ): Promise<Metadata> {
//   // const event = await api.event.get.query({ eventId: params.eventId });
//   // if (!event) {
//   //   return {
//   //     title: "No event found | Soonlist",
//   //     openGraph: {
//   //       images: [],
//   //     },
//   //   };
//   // }
//   const location = await api.location.getLocationBySlug.query({
//     slug: params.slug,
//   });
//   if (!location) {
//     return {
//       title: "Not Found",
//       openGraph: {
//         images: [],
//       },
//     };
//   }

//   // optionally access and extend (rather than replace) parent metadata
//   // images are in the order of square, 4:3, 16:9, cropped
//   // const hasAllImages = eventData.images && eventData.images.length === 4;
//   // const previewImage = hasAllImages ? eventData.images?.slice(2, 3) : undefined;

//   return {
//     title: `Book a Session | ${location.name}`,
//     openGraph: {
//       title: `Book a Session | ${location.name}`,
//       // description: `(${eventData.startDate} ${eventData.startTime}-${eventData.endTime}) ${eventData.description}`,
//       url: `${process.env.NEXT_PUBLIC_URL}/${location.slug}`,
//       // type: "article",
//       // images: previewImage || (await parent).openGraph?.images || [],
//     },
//   };
// }

export default async function Page() {
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

  //const id = params.id;

  const location = await api.location.getLocationByUserId.query();

  if (!location) {
    notFound();
  }

  const [locationSettings, resources] = await Promise.all([
    api.location.getLocationSettingsByLocationId.query({
      locationId: location.id,
    }),
    api.resource.getResourcesByLocationId.query({ locationId: location.id }),
  ]);

  if (!locationSettings || !resources) {
    notFound();
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">New Booking</h2>
          {/* <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div> */}
        </div>
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Booking</CardTitle>
            <CardDescription>There are 10 bookings today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <BookingForm
                location={location}
                locationSettings={locationSettings}
                resources={resources}
                viewContext="dashboard"
              />
            </Suspense>
            {/* <BookingsList
                    bookings={upcomingBookings.bookings}
                    timezone={locationSettings.timeZone}
                  /> */}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
