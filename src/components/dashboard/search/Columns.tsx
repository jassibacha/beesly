"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import type { Booking, Location } from "@/server/db/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Link from "next/link";

// Add timezone to booking type to ensure date/time is displayed correctly
type BookingWithTimezone = Booking & {
  timezone: string;
};

export const columns: ColumnDef<BookingWithTimezone>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={getBadgeVariant(row.original.status)} className="">
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return (
        <>
          <span className="hidden lg:inline">
            {DateTime.fromJSDate(row.original.startTime, {
              zone: row.original.timezone,
            }).toFormat("ccc,")}{" "}
          </span>
          {DateTime.fromJSDate(row.original.startTime, {
            zone: row.original.timezone,
          }).toFormat("LLL dd yyyy")}
        </>
      );
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      return (
        <>
          {DateTime.fromJSDate(row.original.startTime, {
            zone: row.original.timezone,
          }).toFormat("h:mm a")}{" "}
          -{" "}
          {DateTime.fromJSDate(row.original.endTime, {
            zone: row.original.timezone,
          }).toFormat("h:mm a")}
          <span className="hidden lg:inline">
            {" "}
            {DateTime.fromJSDate(row.original.startTime, {
              zone: row.original.timezone,
            }).toFormat("ZZZZ")}
          </span>
        </>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Name",
  },
  {
    accessorKey: "customerPhone",
    header: "Phone",
  },
  {
    accessorKey: "customerEmail",
    header: "Email",
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/bookings/edit/${row.original.id}`}>Edit</Link>
        </Button>
      );
    },
  },
];
