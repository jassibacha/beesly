"use client";
//import { Booking } from "@/server/db/types";
import { api } from "@/trpc/react";
import { BookingItem } from "./BookingItem";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocationContext } from "@/context/LocationContext";
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-misused-promises */

interface BookingsListProps {
  //bookings: Booking[];
  type: "upcoming" | "recent";
  //timezone: string;
  // location: Location;
  // locationSettings: LocationSetting;
  // resources: Resource[];
  limit?: number;
}

export default function BookingsList({
  type,
  // timezone,
  // location,
  // locationSettings,
  // resources,
  limit = 5,
}: BookingsListProps) {
  const { location, locationSettings, resources, isLoading } =
    useLocationContext();

  let bookings: Booking[] = [];
  let refetch: () => void = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  let isLoadingBookings = false;
  let title = "";
  let desc = "";

  if (type === "upcoming") {
    const {
      data: bookingsData,
      refetch: refetchUpcoming,
      isLoading: isLoadingUpcoming,
    } = api.booking.listUpcomingBookings.useQuery(
      {
        locationId: location?.id ?? "",
        limit: limit,
      },
      {
        enabled: !isLoading && !!location,
        refetchOnMount: "always", // Refetch always on mount or re-mount
        refetchInterval: 300000, // Refetch every 5 minutes
      },
    );
    bookings = bookingsData?.bookings ?? [];
    const countForToday = bookingsData?.countForToday ?? "X"; // Get the count for today from the query result
    refetch = refetchUpcoming;
    isLoadingBookings = isLoadingUpcoming;
    title = "Upcoming Bookings";
    desc = `There are ${countForToday} bookings today`;
  } else if (type === "recent") {
    const {
      data: bookingsData,
      refetch: refetchRecent,
      isLoading: isLoadingRecent,
    } = api.booking.listRecentBookings.useQuery(
      {
        locationId: location?.id ?? "",
        limit: limit,
      },
      {
        enabled: !isLoading && !!location,
        refetchOnMount: "always", // Refetch always on mount or re-mount
        refetchInterval: 300000, // Refetch every 5 minutes
      },
    );
    bookings = bookingsData?.bookings ?? [];
    const countInLast24Hours = bookingsData?.countInLast24Hours ?? "X"; // Get the count for the last 24 hours from the query result
    refetch = refetchRecent;
    isLoadingBookings = isLoadingRecent;
    title = "Recent Bookings";
    desc = `You have ${countInLast24Hours} bookings in the past 24h`;
  }

  const renderBookings = () => {
    if (
      isLoadingBookings ||
      isLoading ||
      !location ||
      !locationSettings ||
      !resources
    ) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin" />{" "}
          {/* Loading icon with spin animation */}
          <span>Loading...</span>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div>No bookings found</div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {bookings.map((booking) => (
          <BookingItem
            key={booking.id}
            booking={booking}
            timezone={location?.timezone}
            location={location}
            locationSettings={locationSettings}
            resources={resources}
            refetch={refetch}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{renderBookings()}</CardContent>
    </Card>
  );
}
