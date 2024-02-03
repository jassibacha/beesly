"use client";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

interface BookingPageProps {
  slug: string;
}

export function BookingPage({ slug }: BookingPageProps) {
  const {
    data: location,
    isLoading: isLoadingLocation,
    error: locationError,
    isSuccess: isLocationSuccess,
  } = api.location.getLocationBySlug.useQuery({ slug }, { enabled: !!slug });

  const [locationId, setLocationId] = useState<string | null>(null);

  // Fetch location settings once we have the location ID
  const {
    data: locationSettings,
    isLoading: isLoadingLocationSettings,
    error: locationSettingsError,
  } = api.location.getLocationSettingsByLocationId.useQuery(
    { locationId: locationId ?? "" },
    { enabled: !!locationId },
  );

  // Set locationId state once location data is available
  useEffect(() => {
    if (location) {
      setLocationId(location.id);
    }
  }, [location]);

  // Handle loading and error states
  if (isLoadingLocation) return <div>Loading Location...</div>;
  if (locationError) return <div>Error: {locationError.message}</div>;
  if (!location) return <div>Location not found</div>;
  if (locationSettingsError)
    return (
      <div>
        Error fetching location settings: {locationSettingsError.message}
      </div>
    );

  return (
    <div>
      <div>Slug: {slug}</div>
      <div>Location: {location.id}</div>
      {isLoadingLocationSettings ? (
        <div>Loading Location Settings...</div>
      ) : (
        <div>Location Settings: {JSON.stringify(locationSettings)}</div>
      )}
      {/* <div>Location Settings: {JSON.stringify(locationSettings)}</div> */}
    </div>
  );
}

// function BookingPage(props: slug) {
//   return (
//     <div>BookingPage</div>
//   )
// }

// export default BookingPage
