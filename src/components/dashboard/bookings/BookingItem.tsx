import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";

interface BookingItemProps {
  booking: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    startTime: Date;
    endTime: Date;
  };
  timezone: string;
}

export function BookingItem({ booking, timezone }: BookingItemProps) {
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
      <div className="ml-auto text-right">
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
      <Button variant="outline" size="sm" asChild className="ml-2">
        <Link href={`/dashboard/bookings/edit/${booking.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
