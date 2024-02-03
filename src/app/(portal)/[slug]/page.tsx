// "use client";
// import Form from "@/app/ui/invoices/edit-form";
// import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
// import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";
// import { type Metadata } from "next";
// import Head from "next/head";
// //import { api } from "@/trpc/server";
// import { useRouter } from "next/router"; // Correct hook for client-side routing
// import { api } from "@/trpc/react"; // Assuming this is the correct import path for your TRPC api

// export const metadata: Metadata = {
//   title: `${slug} Booking`,
// };

// export default function Page() {
//   const router = useRouter();
//   const { slug } = router.query;

//   if (!slug) {
//     notFound();
//   }

//   // Using TRPC's useQuery hook correctly within the component body to fetch location data
//   const {
//     data: location,
//     isLoading,
//     error,
//   } = api.location.getLocationBySlug.useQuery(
//     { slug: slug as string },
//     {
//       enabled: !!slug, // This ensures the query runs only if slug is available
//     },
//   );

//   // Conditional rendering based on loading/error states or if the location data is present
//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;
//   if (!location) return <div>Location not found</div>; // Handling not found location

//   return (
//     <>
//       <Head>
//         <title>{slug} Booking</title>
//       </Head>
//       <main>
//         Slug: {slug}
//         {location ? "Location found" : "Location not found"}
//         {/* <Breadcrumbs
//         breadcrumbs={[
//           { label: "Invoices", href: "/dashboard/invoices" },
//           {
//             label: "Edit Invoice",
//             href: `/dashboard/invoices/${id}/edit`,
//             active: true,
//           },
//         ]}
//       />
//       <Form invoice={invoice} customers={customers} /> */}
//       </main>
//     </>
//   );
// }

import { api } from "@/trpc/server";
import { BookingPage } from "./_components/BookingPage";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // const location = await api.location.getLocationBySlug.query({ slug });

  // const [invoice, customers] = await Promise.all([
  //   fetchInvoiceById(id),
  //   fetchCustomers(),
  // ]);

  if (!slug) {
    notFound();
  }

  return (
    <>
      <main>
        Slug: {slug}
        <BookingPage slug={slug} />
        {/* {location ? "Location found" : "Location not found"} */}
        {/* <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} /> */}
      </main>
    </>
  );
}
