import type { Metadata } from "next";
// import Search from "./_components/Search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import debounce from "lodash/debounce";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { notFound, redirect } from "next/navigation";
import DailyBookings from "@/components/dashboard/DailyBookings";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import BookingsList from "@/components/dashboard/bookings/BookingsList";
import SearchResults from "@/components/dashboard/search/SearchResults";
import SearchInput from "@/components/dashboard/search/SearchInput";

export const metadata: Metadata = {
  title: "Search",
  description: "Example dashboard app built using the components.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    p?: string;
  };
}) {
  const query = searchParams?.q ?? "";
  const currentPage = Number(searchParams?.p) || 1;

  const location = await api.location.getLocationByUserId.query();

  //const totalPages = await fetchInvoicesPages(query);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Search</h2>
        </div>
        <div className="space-y-4">
          <SearchInput placeholder="Search bookings..." />
          <SearchResults
            query={query}
            currentPage={currentPage}
            location={location}
          />
        </div>
      </div>
    </>
  );
}

function fetchInvoicesPages(query: string) {
  // noStore();
  // try {
  //   const count = await sql`SELECT COUNT(*)
  //   FROM invoices
  //   JOIN customers ON invoices.customer_id = customers.id
  //   WHERE
  //     customers.name ILIKE ${`%${query}%`} OR
  //     customers.email ILIKE ${`%${query}%`} OR
  //     invoices.amount::text ILIKE ${`%${query}%`} OR
  //     invoices.date::text ILIKE ${`%${query}%`} OR
  //     invoices.status ILIKE ${`%${query}%`}
  // `;
  //   const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
  //   return totalPages;
  // } catch (error) {
  //   console.error("Database Error:", error);
  //   throw new Error("Failed to fetch total number of invoices.");
  // }
}
