"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBadgeVariant } from "@/lib/utils";
import type { Booking, Location } from "@/server/db/types";
import type {
  ColumnDef,
  HeaderContext,
  CellContext,
} from "@tanstack/react-table";
import { DateTime } from "luxon";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { EditBookingButton } from "../bookings/EditBookingButton";
import type { QueryObserverResult } from "@tanstack/react-query";

// Add timezone to booking type to ensure date/time is displayed correctly
type BookingWithTimezone = Omit<Booking, "startTime" | "endTime"> & {
  timezone: string;
  startTime: string;
  endTime: string;
};

const convertToBooking = (
  bookingWithTimezone: BookingWithTimezone,
): Booking => {
  const { timezone, ...booking } = bookingWithTimezone;
  return {
    ...booking,
    startTime: new Date(bookingWithTimezone.startTime),
    endTime: new Date(bookingWithTimezone.endTime),
  };
};

// Reswap this for client side fetching
export const getColumns = (
  //refetch: () => void,
  refetch: () => Promise<
    QueryObserverResult<BookingWithTimezone[] | null | undefined, unknown>
  >,
): ColumnDef<BookingWithTimezone>[] => {
  return [
    {
      id: "Status",
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
          <div className="flex items-center justify-center">
            <Badge variant={getBadgeVariant(row.original.status)} className="">
              {row.original.status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "Date & Time",
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
      id: "Name",
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
      id: "Phone",
      accessorKey: "customerPhone",
      header: "Phone",
    },
    {
      id: "Email",
      accessorKey: "customerEmail",
      header: "Email",
    },
    {
      id: "Actions",
      accessorKey: "Actions",
      header: "",
      // This could eventually be an area where they could re-send emails, etc.
      cell: ({ row }) => {
        const booking = convertToBooking(row.original);
        return (
          <>
            <EditBookingButton
              variant="outline"
              size="sm"
              buttonType="IconOnly"
              booking={booking}
              refetch={refetch}
            />
          </>
        );
      },
      enableHiding: false,
    },
  ];
};

// The original server side fetch, testing purposes
export const columns: ColumnDef<BookingWithTimezone>[] = [
  {
    id: "Status",
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
    id: "Date & Time",
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
    id: "Name",
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
    id: "Phone",
    accessorKey: "customerPhone",
    header: "Phone",
  },
  {
    id: "Email",
    accessorKey: "customerEmail",
    header: "Email",
  },
  {
    id: "Actions",
    accessorKey: "Actions",
    header: "",
    // This could eventually be an area where they could re-send emails, etc.
    cell: ({ row }) => {
      return (
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/bookings/edit/${row.original.id}`}>Edit</Link>
        </Button>
      );
    },
    enableHiding: false,
  },
];
