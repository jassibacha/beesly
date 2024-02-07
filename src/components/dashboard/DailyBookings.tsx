"use client";
import { api } from "@/trpc/react";
import { DateTime } from "luxon";
import { useUser } from "@clerk/nextjs";
function DailyBookings() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Use `useQuery` to fetch bookings. Note that we're not calling `.query` directly;
  // useQuery is the hook provided by TRPC for React.
  // Adjust the query key accordingly if your procedure expects any parameters.
  const { data, isLoading, error } = api.booking.listBookings.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Function to safely format booking times
  const formatBookingTime = (time: Date | null) => {
    if (!time) return "N/A"; // Handle null dates
    return DateTime.fromJSDate(new Date(time))
      .setZone("America/Los_Angeles") // Ensure time is treated as UTC
      .startOf("minute") // Align to the start of the minute, effectively setting seconds to :00
      .toFormat("ff"); // Customize this format as needed
  };

  // Log raw startTime and endTime
  console.log(
    "Raw Booking Times:",
    data.bookings?.map((booking) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
    })),
  );

  return (
    <div>
      {data.bookings?.length ? (
        <ul>
          {data.bookings.map((booking) => (
            <li key={booking.id}>
              {booking.customerName} - {formatBookingTime(booking.startTime)} to{" "}
              {formatBookingTime(booking.endTime)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
}

export default DailyBookings;
