import { notFound } from "next/navigation";
import ThankYouPage from "./_components/ThankYouPage";
import LocationHeader from "./_components/LocationHeader";
import { type Metadata, type ResolvingMetadata } from "next/types";
import { api } from "@/trpc/server";
import { Booking } from "@/server/db/types";
import { Globe, Mail, Phone, XOctagon } from "lucide-react";
import { TRPCError } from "@trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
    bookingId: string;
  };
  // query?: {
  //   booking?: string;
  // };
};
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
    title: `Thank You | ${location.name}`,
    openGraph: {
      title: `Thank You | ${location.name}`,
      // description: `(${eventData.startDate} ${eventData.startTime}-${eventData.endTime}) ${eventData.description}`,
      url: `${process.env.NEXT_PUBLIC_URL}/${location.slug}`,
      // type: "article",
      // images: previewImage || (await parent).openGraph?.images || [],
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
