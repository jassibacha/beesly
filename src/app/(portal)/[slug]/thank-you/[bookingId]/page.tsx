import { notFound } from "next/navigation";
import ThankYouPage from "./_components/ThankYouPage";
import LocationHeader from "./_components/LocationHeader";
import { type Metadata, type ResolvingMetadata } from "next/types";
import { api } from "@/trpc/server";
import type { Booking, Location } from "@/server/db/types";
import { Globe, Mail, Phone, XOctagon } from "lucide-react";
import { TRPCError } from "@trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DateTime } from "luxon";

type Props = {
  params: {
    slug: string;
    bookingId: string;
  };
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug, bookingId } = params;

  const location = await api.location.getLocationBySlug.query({
    slug,
  });
  if (!location) {
    return {
      title: "Not Found",
      // openGraph: {
      //   images: [],
      // },
    };
  }

  const booking = await api.booking.getBookingByIdOrNull.query({ bookingId });
  if (!booking) {
    return {
      title: "Not Found",
      // openGraph: {
      //   images: [],
      // },
    };
  }

  const startDate = DateTime.fromJSDate(booking.startTime).toFormat(
    "LLLL dd, yyyy",
  );
  const startTime = DateTime.fromJSDate(booking.startTime).toFormat("hh:mm a");

  return {
    title: `Thank you from ${location.name}`,
    description: `We'll see you on ${startDate} at ${startTime}!`,
    openGraph: {
      title: `Thank you from ${location.name}`,
      description: `Your booking is confirmed for ${startDate} at ${startTime}.`,
      url: `${process.env.NEXT_PUBLIC_URL}/${location.slug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug, bookingId } = params;
  // const slug = params.slug;
  // const bookingId = query?.booking;

  // if (!bookingId) {
  //   return notFound();
  // }

  console.log("bookingId", bookingId);

  const location = await api.location.getLocationBySlug.query({
    slug: params.slug,
  });

  if (!slug || !location) {
    return notFound();
  }

  const booking = await api.booking.getBookingByIdOrNull.query({ bookingId });

  if (!bookingId || !booking) {
    return (
      <div className="h-full">
        <LocationHeader location={location} />
        <div className="h-full w-full py-8">
          <div className="mx-auto my-12 max-w-xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-semibold">
              Booking Not Found <XOctagon className="inline h-8 w-8" />
            </h1>
            <h2 className="mb-4 text-xl font-bold">
              We were unable to locate that booking. If this is an error, please
              contact {location.name}.
            </h2>
            <div className="flex flex-wrap justify-center space-x-2 sm:flex-nowrap">
              {location.phone && (
                <Button variant="outline" asChild>
                  <Link href={`tel:${location.phone}`}>
                    <Phone className="mr-2 inline h-3 w-3" />
                    {location.phone}
                  </Link>
                </Button>
              )}
              {location.email && (
                <Button variant="outline" asChild>
                  <Link href={`mailto:${location.email}`}>
                    <Mail className="mr-2 inline h-3 w-3" />
                    {location.email}
                  </Link>
                </Button>
              )}
              {location.website && (
                <Button variant="outline" asChild>
                  <Link href={location.website} target="_blank">
                    <Globe className="mr-2 inline h-3 w-3" />
                    Website
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [locationSettings, resources] = await Promise.all([
    api.location.getLocationSettingsByLocationId.query({
      locationId: location.id,
    }),
    api.resource.getResourcesByLocationId.query({ locationId: location.id }),
    //api.booking.getBookingById.query({ bookingId: bookingId }),
  ]);

  // Attempt to fetch the booking, location settings, and resources
  // const locationSettingsPromise =
  //   api.location.getLocationSettingsByLocationId.query({
  //     locationId: location.id,
  //   });
  // const resourcesPromise = api.resource.getResourcesByLocationId.query({
  //   locationId: location.id,
  // });
  // type BookingResponse = Booking | null;

  // let bookingPromise: Promise<BookingResponse> = Promise.resolve(null);

  // // If a booking ID is provided, attempt to fetch the booking details
  // if (bookingId) {
  //   bookingPromise = api.booking.getBookingById.query({ bookingId });
  // }

  // const [locationSettings, resources, booking] = await Promise.all([
  //   locationSettingsPromise,
  //   resourcesPromise,
  //   bookingPromise,
  // ]);

  if (!locationSettings || !resources) {
    return notFound();
  }
  return (
    <div className="h-full">
      <LocationHeader location={location} />
      <ThankYouPage
        location={location}
        locationSettings={locationSettings}
        booking={booking}
      />
    </div>
  );
}
