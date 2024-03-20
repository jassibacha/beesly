import { useState } from "react";
import SearchInput from "@/components/dashboard/search/SearchInput";
import Pagination from "@/components/dashboard/search/Pagination";
import { api } from "@/trpc/server";
import type { Location } from "@/server/db/types";

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
    <div>
      {bookingResults?.map((booking) => (
        <div key={booking.id}>
          <h2>{booking.customerName}</h2>
          <p>
            {booking.customerEmail} {booking.customerPhone}
          </p>
        </div>
      ))}
    </div>
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
