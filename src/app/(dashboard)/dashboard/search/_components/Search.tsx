"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";

export default function Search() {
  const router = useRouter();
  // Use the 's' query parameter as the initial value for searchQuery
  const [searchQuery, setSearchQuery] = useState(
    () => router.query.get("s") || "",
  );
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce the search query update
  const updateDebouncedQuery = debounce((query) => {
    setDebouncedQuery(query);
  }, 500); // Adjust the delay as needed

  useEffect(() => {
    updateDebouncedQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Update the URL with the debounced search query without navigating
    router.replace(
      { pathname: "/dashboard/search", query: { s: debouncedQuery } },
      undefined,
      {
        shallow: true,
      },
    );
  }, [debouncedQuery, router]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      Search Query: {searchQuery}
      {/* Your client-side component content here */}
    </div>
  );
}
