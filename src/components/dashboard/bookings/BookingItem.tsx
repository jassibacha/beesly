"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { EditBookingDialog } from "./EditBookingDialog";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";
interface BookingItemProps {
  booking: Booking;
  // booking: {
  //   id: string;
  //   customerName: string;
  //   customerEmail: string;
  //   customerPhone: string;
  //   startTime: Date;
  //   endTime: Date;
  //   status: string;
  // };
  timezone: string;
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
  refetch: () => void;
}

type BadgeVariant = "default" | "secondary" | "destructive";

function getBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "secondary";
    default:
      return "default";
  }
}

export function BookingItem({
  booking,
  timezone,
  location,
  locationSettings,
  resources,
  refetch,
}: BookingItemProps) {
  const badgeVariant = getBadgeVariant(booking.status);

  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarFallback>
          {booking.customerName.match(/\b(\w)/g)?.join("")}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">
          {booking.customerName}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.customerPhone}
          <br />
          {booking.customerEmail}
        </p>
      </div>
      <div className="ml-auto">
        <p className="text-right text-sm font-medium">
          Status: <Badge variant={badgeVariant}>{booking.status}</Badge>
        </p>
        <div className="text-right">
          <p className="font-medium">
            {DateTime.fromJSDate(booking.startTime)
              .setZone(timezone)
              .toFormat("ccc, LLL dd yyyy")}
          </p>
          <p className="text-sm text-muted-foreground">
            {DateTime.fromJSDate(booking.startTime)
              .setZone(timezone)
              .toFormat("h:mm a")}{" "}
            -{" "}
            {DateTime.fromJSDate(booking.endTime)
              .setZone(timezone)
              .toFormat("h:mm a")}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild className="ml-2 md:hidden">
        <Link href={`/dashboard/bookings/edit/${booking.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <div className="ml-2 hidden md:block">
        <EditBookingDialog
          key={`edit${booking.id}`}
          location={location}
          locationSettings={locationSettings}
          resources={resources}
          //id={booking.id}
          booking={booking}
          variant="outline"
          size="sm"
          buttonType="IconOnly"
          refetch={refetch}
        />
      </div>
    </div>
  );
}
