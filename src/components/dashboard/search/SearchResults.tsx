"use client";
import { api } from "@/trpc/react";
import type { Location } from "@/server/db/types";
import { getColumns } from "./Columns";
import { DataTable } from "./DataTable";
import { notFound } from "next/navigation";

export default function SearchResults({
  query,
  location,
}: {
  query: string;
  location: Location;
}) {
  if (!location) {
    notFound();
  }
  // We could do this as a client fetch instead
  const {
    data: bookingResults,
    refetch: refetchResults,
    isLoading: isLoadingResults,
  } = api.booking.searchBookings.useQuery(
    {
      query: query,
      locationId: location.id,
    },
    {
      // Fetch all results initially, then filter based on query
      enabled: query !== "" || location.id !== "",
    },
  );

  const columns = getColumns(refetchResults);

  return (
    <div className="pt-0">
      <DataTable
        columns={columns}
        data={bookingResults ?? []}
        isLoading={isLoadingResults}
      />
    </div>
  );
}
