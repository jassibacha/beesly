"use client";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/BookingForm";

export function NewBookingDialog() {
  const [openNewDialog, setOpenNewDialog] = useState(false);

  //const { user } = useDashboardUser();

  // const { data: location } = api.location.getLocationByUserId.useQuery();
  // const { data: locationSettings } =
  //   api.location.getLocationSettingsByLocationId.useQuery(
  //     { locationId: location?.id ?? "" },
  //     { enabled: !!location },
  //   );
  // const { data: resources } = api.resource.getResourcesByLocationId.useQuery(
  //   { locationId: location?.id ?? "" },
  //   { enabled: !!location },
  // );

  // if (!location || !locationSettings || !resources) {
  //   return <Skeleton className="h-8 w-32 rounded-md" />;
  // }

  return (
    <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <PlusCircle className="mr-1 h-4 w-4" />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>Make a new booking now.</DialogDescription>
        </DialogHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <BookingForm
            // location={location}
            // locationSettings={locationSettings}
            // resources={resources}
            viewContext="dialog"
            closeDialog={() => setOpenNewDialog(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
