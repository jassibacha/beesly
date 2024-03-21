"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import type { Booking, Location } from "@/server/db/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// Add timezone to booking type to ensure date/time is displayed correctly
type BookingWithTimezone = Omit<Booking, "startTime" | "endTime"> & {
  timezone: string;
  startTime: string;
  endTime: string;
};

export const columns: ColumnDef<BookingWithTimezone>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge variant={getBadgeVariant(row.original.status)} className="">
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date &amp; Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="items-left flex flex-col lg:flex-row">
          <span className="mr-0 block w-[100px] lg:mr-2 lg:w-[130px]">
            <span className="hidden lg:inline">
              {DateTime.fromISO(row.original.startTime, {
                zone: row.original.timezone,
              }).toFormat("ccc,")}{" "}
            </span>
            {DateTime.fromISO(row.original.startTime, {
              zone: row.original.timezone,
            }).toFormat("LLL dd yyyy")}
          </span>
          <span>
            {DateTime.fromISO(row.original.startTime, {
              zone: row.original.timezone,
            }).toFormat("h:mma")}{" "}
            -{" "}
            {DateTime.fromISO(row.original.endTime, {
              zone: row.original.timezone,
            }).toFormat("h:mma")}
            <span className="hidden lg:inline">
              {" "}
              {DateTime.fromISO(row.original.startTime, {
                zone: row.original.timezone,
              }).toFormat("ZZZZ")}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
