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
  // location: Location;
  // locationSettings: LocationSetting;
  // resources: Resource[];
  booking: Booking;
  buttonType?: "IconOnly" | "Normal";
  variant:
    | "secondary"
    | "outline"
    | "link"
    | "default"
    | "destructive"
    | "ghost";
  size: "sm" | "default" | "lg";
  refetch?: () => void;
}

export function EditBookingDialog({
  // location,
  // locationSettings,
  // resources,
  booking,
  buttonType = "Normal",
  variant,
  size = "default",
  refetch,
}: BookingDialogProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);

  if (!booking) {
    notFound();
  }

  let title;
  let description;

  switch (booking.status) {
    case "COMPLETED":
      title = `Booking: ${booking.id}`;
      description = "This booking has been completed.";
      break;
    case "CANCELLED":
      title = `Booking: ${booking.id}`;
      description = "This booking has been cancelled.";
      break;
    case "ACTIVE":
    default:
      title = `Edit Booking: ${booking.id}`;
      description = "Update this booking.";
      break;
  }

  return (
    <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
      {/* <Dialog> */}
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Pencil
            className={`${buttonType === "IconOnly" ? "h-4 w-4" : "mr-1 h-3 w-3 "}`}
          />
          {buttonType === "Normal" && "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <BookingForm
            // location={location}
            // locationSettings={locationSettings}
            // resources={resources}
            booking={booking}
            viewContext="dialog"
            closeDialog={() => setOpenEditDialog(false)}
            refetch={refetch}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
