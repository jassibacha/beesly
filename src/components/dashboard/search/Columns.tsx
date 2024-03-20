"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import type { Booking, Location } from "@/server/db/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const getColumns = (location: Location): ColumnDef<Booking>[] => [
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
          <span className="hidden md:inline">
            {DateTime.fromJSDate(row.original.startTime, {
              zone: location.timezone,
            }).toFormat("ccc, ")}
          </span>
          {DateTime.fromJSDate(row.original.startTime, {
            zone: location.timezone,
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
            zone: location.timezone,
          }).toFormat("h:mm a")}{" "}
          -{" "}
          {DateTime.fromJSDate(row.original.endTime, {
            zone: location.timezone,
          }).toFormat("h:mm a")}
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

export const columns: ColumnDef<Booking>[] = [
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
          <span className="hidden md:inline">
            {DateTime.fromJSDate(row.original.startTime).toFormat("ccc, ")}
          </span>
          {DateTime.fromJSDate(row.original.startTime).toFormat("LLL dd yyyy")}
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
          {DateTime.fromJSDate(row.original.startTime).toFormat("h:mm a")} -{" "}
          {DateTime.fromJSDate(row.original.endTime).toFormat("h:mm a")}
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
