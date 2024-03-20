"use client";

import { api } from "@/trpc/react";
//import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";
import { getColumns } from "./Columns";
import { DataTable } from "./DataTable";

export default function SearchResultsDtC({
  query,
  currentPage,
  location,
}: {
  query: string;
  currentPage: number;
  location: Location;
}) {
  const columns = getColumns(location);
  // // We could do this as a client fetch instead
  // const bookingResults = await api.booking.searchBookings.query({
  //   query: query,
  //   locationId: location.id,
  // });

  const { data: bookingResults, isLoading } =
    api.booking.searchBookings.useQuery(
      {
        query: query,
        locationId: location.id,
      },
      {
        enabled: !!query,
      },
    );

  // if (isLoading) {
  //   return <div>LOADING</div>;
  // }

  return (
    <div className="container mx-auto py-10">
      {/* {bookingResults && <DataTable columns={columns} data={bookingResults} />} */}
      <DataTable columns={columns} data={bookingResults ?? []} />
    </div>
  );
}
