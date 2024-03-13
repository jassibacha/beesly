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
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-misused-promises */

interface BookingsListProps {
  //bookings: Booking[];
  type: "upcoming" | "recent";
  timezone: string;
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
  limit?: number;
}

export default function BookingsList({
  type,
  timezone,
  location,
  locationSettings,
  resources,
  limit = 5,
}: BookingsListProps) {
  let bookings: Booking[] = [];
  let refetch: () => void = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  let title = "";
  let desc = "";

  if (type === "upcoming") {
    const { data: bookingsData, refetch: refetchUpcoming } =
      api.booking.listUpcomingBookings.useQuery({
        locationId: location.id,
        limit: limit,
      });
    bookings = bookingsData?.bookings ?? [];
    refetch = refetchUpcoming;
    title = "Upcoming Bookings";
    desc = "There are X bookings today"; // TODO: Make this dynamic (additional query inside of trpc?)
  } else if (type === "recent") {
    const { data: bookingsData, refetch: refetchRecent } =
      api.booking.listRecentBookings.useQuery({
        locationId: location.id,
        limit: limit,
      });
    bookings = bookingsData?.bookings ?? [];
    refetch = refetchRecent;
    title = "Recent Bookings";
    desc = "You have X bookings in the past 24h"; // TODO: Make this dynamic (additional query inside of trpc?)
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {bookings.map((booking) => (
            <BookingItem
              key={booking.id}
              booking={booking}
              timezone={timezone}
              location={location}
              locationSettings={locationSettings}
              resources={resources}
              refetch={refetch}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
