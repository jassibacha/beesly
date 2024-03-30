// "use client";
import { notFound } from "next/navigation";

import { api } from "@/trpc/server";
import { BookingPage } from "./_components/BookingPage";
import { type Metadata, type ResolvingMetadata } from "next/types";
import { Suspense, useContext } from "react";
import { TimezoneContext } from "@/context/TimezoneContext";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const location = await api.location.getLocationBySlug.query({
    slug: params.slug,
  });
  if (!location) {
    return {
      title: "Not Found",
      description: "Location not found",
      // openGraph: {
      //   images: [],
      // },
    };
  }

  return {
    title: `Book a Session | ${location.name}`,
    description: `Book a VR session at ${location.name} today!`,
    openGraph: {
      title: `${location.name} | Book a Session`,
      description: `Book a VR session at ${location.name} today!`,
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
