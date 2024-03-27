import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";
import { getColumns, columns } from "./Columns";
import { DataTable } from "./DataTable";

export default async function SearchResultsDtS({
  query,
  location,
}: {
  query: string;
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
