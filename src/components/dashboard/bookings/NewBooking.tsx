import { Copy, PlusCircle } from "lucide-react";

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
import { Suspense, useState } from "react";
import { BookingForm } from "@/components/forms/BookingForm";
import { NewBookingDialog } from "./NewBookingDialog";

export async function NewBooking() {
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
    <NewBookingDialog
      location={location}
      locationSettings={locationSettings}
      resources={resources}
    />
  );
}
