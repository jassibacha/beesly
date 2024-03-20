import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant } from "@/lib/utils";

export default async function SearchResults({
  query,
  currentPage,
  location,
}: {
  query: string;
  currentPage: number;
  location: Location;
}) {
  //const invoices = await fetchFilteredInvoices(query, currentPage);

  //
  const bookingResults = await api.booking.searchBookings.query({
    query: query,
    locationId: location.id,
  });
  // const [searchQuery, setSearchQuery] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
  // const totalPages = 10; // This should be dynamically calculated based on your data

  // const handleSearch = (query: string) => {
  //   setSearchQuery(query);
  //   setCurrentPage(1); // Reset to the first page when a new search is performed
  // };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookingResults.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                <Badge variant={getBadgeVariant(booking.status)} className="">
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="hidden md:inline">
                  {DateTime.fromJSDate(booking.startTime, {
                    zone: location.timezone,
                  }).toFormat("ccc, ")}
                </span>
                {DateTime.fromJSDate(booking.startTime, {
                  zone: location.timezone,
                }).toFormat("LLL dd yyyy")}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(booking.startTime, {
                  zone: location.timezone,
                }).toFormat("h:mm a")}{" "}
                -{" "}
                {DateTime.fromJSDate(booking.endTime, {
                  zone: location.timezone,
                }).toFormat("h:mm a")}
              </TableCell>
              <TableCell>{booking.customerName}</TableCell>
              <TableCell>{booking.customerPhone}</TableCell>
              <TableCell>{booking.customerEmail}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/bookings/edit/${booking.id}`}>
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <div>
        {bookingResults?.map((booking) => (
          <div key={booking.id}>
            <h2>{booking.customerName}</h2>
            <p>
              {booking.customerEmail} {booking.customerPhone}
            </p>
          </div>
        ))}
      </div> */}
    </>
  );
  {
    /* <SearchInput onSearch={handleSearch} /> */
  }
  {
    /* {searchQuery} */
  }
  {
    /* Render your search results here */
  }
  {
    /* <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      /> */
  }
}

// async function fetchFilteredInvoices(query: string, currentPage: number) {
//   noStore();
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices.rows;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoices.");
//   }
// }
