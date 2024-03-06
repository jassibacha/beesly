"use client";

import type { Booking, Location, LocationSetting } from "@/server/db/types";
import { BadgeCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ThankYouPageProps {
  location: Location;
  locationSettings: LocationSetting;
  booking: Booking;
}

function ThankYouPage({
  location,
  locationSettings,
  booking,
}: ThankYouPageProps) {
  // const searchParams = useSearchParams();
  // const day = searchParams.get("day") ?? "";
  // const start = searchParams.get("start") ?? "";
  // const end = searchParams.get("end") ?? "";
  // const name = searchParams.get("name") ?? "";

  const googleMapsQuery = encodeURIComponent(
    `${location.name} ${location.streetAddress}, ${location.city}, ${location.state} ${location.zipCode}, ${location.country}`,
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`;

  if (!booking) {
    return <div>No booking found</div>;
    // TODO: Make a rendered area that says no booking was found
  }
  const {
    startTime,
    endTime,
    customerName,
    customerEmail,
    customerPhone,
    totalCost,
    taxAmount,
  } = booking;

  return (
    <>
      <div className="h-full w-full  bg-white bg-opacity-5 py-8">
        <div className="container mx-auto my-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="px-6">
            <h1 className="text-3xl font-semibold">
              Booking Confirmed <BadgeCheck className="inline h-8 w-8" />
            </h1>
            <h2 className="text-xl font-bold">
              Thank You for booking with {location.name}!
            </h2>
          </div>
          <div className="px-6">
            <h3 className="text-lg font-semibold">Date and Time</h3>
            <p>
              <strong>Date:</strong>
            </p>
            <p>
              <strong>Start Time:</strong>
            </p>
            <p>
              <strong>End Time:</strong>
            </p>
          </div>
        </div>
        <div className="container mx-auto grid grid-cols-2 gap-4">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
              <CardDescription>How to get to your booking</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <span className="font-semibold">Name:</span> {location.name}
                <br />
                <span className="font-semibold">Phone:</span> {location.phone}
                <br />
                <span className="font-semibold">Email:</span> {location.email}
                <br />
                <span className="font-semibold">Address:</span>
                {location.streetAddress} {location.city}, {location.state}{" "}
                {location.zipCode}
                <br />
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={googleMapsUrl} target="_blank">
                  View on Maps
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Payment will be taken upon arrival
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col text-sm">
                <div className="flex flex-row justify-between border-b py-3">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">$50.00</span>
                </div>
                <div className="flex flex-row justify-between py-3">
                  <span className="font-semibold">Tax</span>
                  <span className="font-bold">$0.00</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text flex flex-col">
                <span className="text-xl font-semibold">
                  Total Booking Price
                </span>
                <span className="text-sm">
                  Overall price and includes rental discount
                </span>
              </div>
              <div className="text">
                <span className="text-4xl font-bold">$50.00</span>
              </div>
            </CardFooter>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Waiver Info</CardTitle>
              <CardDescription>
                Fill out your waiver ahead of time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Molestias similique perferendis, possimus id ratione officia.
                Dolorum id corporis, cumque, fuga enim necessitatibus labore
                corrupti amet perspiciatis aspernatur eum sint dignissimos.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild>
                <Link href="/">Fill Out Waiver</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ThankYouPage;
