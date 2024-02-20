import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingForm } from "../forms/BookingForm";

export async function NewBookingDialog() {
  const location = await api.location.getLocationByUserId.query();

  if (!location) {
    notFound();
  }

  const [locationSettings, resources] = await Promise.all([
    api.location.getLocationSettingsByLocationId.query({
      locationId: location.id,
    }),
    api.resource.getResourcesByLocationId.query({ locationId: location.id }),
  ]);

  if (!locationSettings || !resources) {
    notFound();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">New Booking</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>Make a new booking now.</DialogDescription>
        </DialogHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <BookingForm
            location={location}
            locationSettings={locationSettings}
            resources={resources}
          />
        </Suspense>
        {/* <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div> */}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
