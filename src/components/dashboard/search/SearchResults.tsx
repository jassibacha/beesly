import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";
import { columns } from "./Columns";
import { DataTable } from "./DataTable";

export default async function SearchResultsDtS({
  query,
  currentPage,
  location,
}: {
  query: string;
  currentPage: number;
  location: Location;
}) {
  // We could do this as a client fetch instead
  const bookingResults = await api.booking.searchBookings.query({
    query: query,
    locationId: location.id,
  });

  return (
    <div className="pt-0">
      <DataTable columns={columns} data={bookingResults} />
    </div>
  );
}
