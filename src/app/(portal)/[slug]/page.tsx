// "use client";
import { notFound } from "next/navigation";

import { api } from "@/trpc/server";
import { BookingPage } from "./_components/BookingPage";
import { type Metadata, type ResolvingMetadata } from "next/types";
import { Suspense } from "react";

type Props = {
  params: {
    slug: string;
  };
};

// REMOVE: Referenced from SL event/[eventid]/page.tsx

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // const event = await api.event.get.query({ eventId: params.eventId });
  // if (!event) {
  //   return {
  //     title: "No event found | Soonlist",
  //     openGraph: {
  //       images: [],
  //     },
  //   };
  // }
  const location = await api.location.getLocationBySlug.query({
    slug: params.slug,
  });
  if (!location) {
    return {
      title: "Not Found",
      openGraph: {
        images: [],
      },
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  // images are in the order of square, 4:3, 16:9, cropped
  // const hasAllImages = eventData.images && eventData.images.length === 4;
  // const previewImage = hasAllImages ? eventData.images?.slice(2, 3) : undefined;

  return {
    title: `Book a Session | ${location.name}`,
    openGraph: {
      title: `Book a Session | ${location.name}`,
      // description: `(${eventData.startDate} ${eventData.startTime}-${eventData.endTime}) ${eventData.description}`,
      url: `${process.env.NEXT_PUBLIC_URL}/${location.slug}`,
      // type: "article",
      // images: previewImage || (await parent).openGraph?.images || [],
    },
  };
}

export default async function Page({ params }: Props) {
  const slug = params.slug;

  const location = await api.location.getLocationBySlug.query({
    slug: params.slug,
  });

  if (!slug || !location) {
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

  // TODO: We can grab all of the stuff here, because we're a server component
  // And then pass all of it in as props to a bookingForm component that is client
  // We can probably wait to grab the individual bookings until the client component
  // Or we can grab bookings every time the day changes, eventually at least

  // const [invoice, customers] = await Promise.all([
  //   fetchInvoiceById(id),
  //   fetchCustomers(),
  // ]);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {/* With the suspense, we can pull in everything else inside BookingPage and wait for it to all load */}
        <BookingPage
          location={location}
          locationSettings={locationSettings}
          resources={resources}
        />
      </Suspense>
    </>
  );
}
