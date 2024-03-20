import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant } from "@/lib/utils";

export default async function SearchResults({
  query,
  currentPage,
  location,
}: {
  query: string;
  currentPage: number;
  location: Location;
}) {
  // We could do this as a client fetch instead
  const bookingResults = await api.booking.searchBookings.query({
    query: query,
    locationId: location.id,
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookingResults.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                <Badge variant={getBadgeVariant(booking.status)} className="">
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="hidden md:inline">
                  {DateTime.fromJSDate(booking.startTime, {
                    zone: location.timezone,
                  }).toFormat("ccc, ")}
                </span>
                {DateTime.fromJSDate(booking.startTime, {
                  zone: location.timezone,
                }).toFormat("LLL dd yyyy")}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(booking.startTime, {
                  zone: location.timezone,
                }).toFormat("h:mm a")}{" "}
                -{" "}
                {DateTime.fromJSDate(booking.endTime, {
                  zone: location.timezone,
                }).toFormat("h:mm a")}
              </TableCell>
              <TableCell>{booking.customerName}</TableCell>
              <TableCell>{booking.customerPhone}</TableCell>
              <TableCell>{booking.customerEmail}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/bookings/edit/${booking.id}`}>
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
