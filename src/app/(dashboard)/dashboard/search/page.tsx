import type { Metadata } from "next";
import { api } from "@/trpc/server";
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
