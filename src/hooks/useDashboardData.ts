import type { Location, LocationSetting } from "@/server/db/types";
import { api } from "@/trpc/react";

export function useDashboardData() {
  const locationQuery = api.location.getLocationByUserId.useQuery();
  const locationSettingsQuery =
    api.location.getLocationSettingsByLocationId.useQuery(
      {
        locationId: locationQuery.data?.id ?? "",
      },
      {
        // Only fetch location settings if the location ID is available
        enabled: !!locationQuery.data?.id,
      },
    );
  const resourcesQuery = api.resource.getResourcesByLocationId.useQuery(
    {
      locationId: locationQuery.data?.id ?? "",
    },
    {
      // Only fetch resources if the location ID is available
      enabled: !!locationQuery.data?.id,
    },
  );

  // Refetch all queries
  const refetchAll = () => {
    locationQuery.refetch().catch((error) => {
      console.error("Error refetching location:", error);
    });
    locationSettingsQuery.refetch().catch((error) => {
      console.error("Error refetching location settings:", error);
    });
    resourcesQuery.refetch().catch((error) => {
      console.error("Error refetching resources:", error);
    });
    // Could get rid of catch and put void at the start if we don't want to handle errors
  };

  return {
    location: locationQuery.data ?? ({} as Location),
    locationSettings: locationSettingsQuery.data ?? ({} as LocationSetting),
    resources: resourcesQuery.data ?? ({} as Location),
    isLoading:
      locationQuery.isLoading ||
      locationSettingsQuery.isLoading ||
      resourcesQuery.isLoading,
    error:
      locationQuery.error ??
      locationSettingsQuery.error ??
      resourcesQuery.error,
    refetchAll,
  };
}
