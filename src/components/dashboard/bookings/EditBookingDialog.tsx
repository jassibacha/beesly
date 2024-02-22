import { Pencil } from "lucide-react";

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
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/BookingForm";
import type {
  Booking,
  Location,
  LocationSetting,
  Resource,
} from "@/server/db/types";

interface BookingDialogProps {
  location: Location;
  locationSettings: LocationSetting;
  resources: Resource[];
  booking: Booking;
}

export async function EditBookingDialog({
  location,
  locationSettings,
  resources,
  booking,
}: BookingDialogProps) {
  //const [openEditDialog, setOpenEditDialog] = useState(false);

  if (!location || !locationSettings || !resources || !booking) {
    notFound();
  }

  return (
    // <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Pencil className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit Booking: {booking.id}</DialogTitle>
          <DialogDescription>Update this booking.</DialogDescription>
        </DialogHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <BookingForm
            location={location}
            locationSettings={locationSettings}
            resources={resources}
            booking={booking}
            isInDialog={true}
            //closeDialog={() => setOpenEditDialog(false)}
          />
        </Suspense>
        {/* <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
