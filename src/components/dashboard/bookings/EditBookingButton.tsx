import { Pencil, View, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { notFound } from "next/navigation";
import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/BookingForm";
import type { Booking } from "@/server/db/types";
import Link from "next/link";

interface EditBookingProps {
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
  className?: string;
  refetch?: () => void;
}

const iconSizes = {
  sm: "h-4 w-4",
  default: "h-4 w-4",
  lg: "h-4 w-4",
};

export function EditBookingButton({
  booking,
  buttonType = "Normal",
  variant,
  size = "default",
  className,
  refetch,
}: EditBookingProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);

  if (!booking) {
    notFound();
  }

  const iconSize = iconSizes[size] || iconSizes.default;

  let title;
  let description;

  let buttonText;
  let IconComponent;

  switch (booking.status) {
    case "COMPLETED":
      title = `Booking: ${booking.id}`;
      description = "This booking has been completed.";
      buttonText = "View";
      IconComponent = View;
      break;
    case "CANCELLED":
      title = `Booking: ${booking.id}`;
      description = "This booking has been cancelled.";
      buttonText = "View";
      IconComponent = Eye;
      break;
    case "ACTIVE":
    default:
      title = `Edit Booking: ${booking.id}`;
      description = "Update this booking.";
      buttonText = "Edit";
      IconComponent = Pencil;
      break;
  }

  // TODO: Add classes as a prop that are added into both Button components

  // TODO: Setup different icon heights based on button size

  // TODO: Setup Button Text EDIT or VIEW (and Icons) based on booking status
  // EDIT is for ACTIVE bookings, VIEW is for COMPLETED and CANCELLED bookings

  return (
    <>
      <Button
        variant={variant}
        size={size}
        asChild
        className={`md:hidden ${className}`}
      >
        <Link href={`/dashboard/bookings/edit/${booking.id}`}>
          <IconComponent
            className={`${iconSize} ${buttonType === "IconOnly" ? "" : "mr-1"}`}
          />
          {buttonType === "Normal" && buttonText}
        </Link>
      </Button>
      <div className="hidden md:block">
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          {/* <Dialog> */}
          <DialogTrigger asChild>
            <Button variant={variant} size={size} className={className}>
              <IconComponent
                className={`${iconSize} ${buttonType === "IconOnly" ? "" : "mr-1"}`}
              />
              {buttonType === "Normal" && buttonText}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-5xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <Suspense fallback={<div>Loading...</div>}>
              <BookingForm
                booking={booking}
                viewContext="dialog"
                closeDialog={() => setOpenEditDialog(false)}
                refetch={refetch}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
