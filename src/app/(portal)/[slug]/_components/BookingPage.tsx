"use client";
import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { Button } from "@/components/ui/button";
import type { Location, LocationSetting, Resource } from "@/server/db/types";
import { api } from "@/trpc/react";
import { Phone } from "lucide-react";
import { TimezoneContext } from "@/context/TimezoneContext";
import { useContext } from "react";
import { BookingForm } from "@/components/forms/BookingForm";
import { auth, useUser } from "@clerk/nextjs";

interface BookingPageProps {
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
}

export function BookingPage({
  location,
  locationSettings,
  resources,
}: BookingPageProps) {
  // const { userId, has } = auth();
  const { user } = useUser(); // Use the useUser hook

  const { timezone, setTimezone } = useContext(TimezoneContext);

  if (locationSettings.timeZone) {
    console.log("Auto generated timezone: ", timezone);
    setTimezone(locationSettings.timeZone);
    console.log("Timezone set to: ", locationSettings.timeZone);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex w-full items-center justify-between border-b px-8 py-4">
        <Button variant="ghost" className="flex w-1/3 justify-start">
          <Phone className="mr-2 h-4 w-4" />
          {location.phone}
        </Button>
        <div className=" flex w-1/3 justify-center">
          <h1 className="text-xl font-bold">{location.name}</h1>
        </div>
        <div className="flex w-1/3 justify-end text-right">
          <span className="text-sm font-medium">
            <ModeToggle />
          </span>
        </div>
      </header>
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl py-4">
          {/* Additional content will go here */}
          <pre className="text-sm">
            <p>Test Data</p>
            <p>Current Timezone: {timezone}</p>
            <p>
              {user
                ? `Logged In as ${user.firstName} ${user.lastName}`
                : "No User"}
            </p>
          </pre>

          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <BookingForm
            location={location}
            locationSettings={locationSettings}
            resources={resources}
          />
        </div>
      </main>
    </div>
  );
}
