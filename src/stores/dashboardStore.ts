import { create } from "zustand";
import { api } from "@/trpc/server";

import type { Location, LocationSetting, Resource } from "@/server/db/types";

type DashboardState = {
  location: Location | null;
  locationSettings: LocationSetting | null;
  resources: Resource[] | null;
  fetchLocationData: () => Promise<void>;
};

const useDashboardStore = create<DashboardState>((set) => ({
  location: null,
  locationSettings: null,
  resources: null,
  fetchLocationData: async () => {
    try {
      const location = await api.location.getLocationByUserId.query();
      if (location) {
        const [locationSettings, resources] = await Promise.all([
          api.location.getLocationSettingsByLocationId.query({
            locationId: location.id,
          }),
          api.resource.getResourcesByLocationId.query({
            locationId: location.id,
          }),
        ]);
        set({ location, locationSettings, resources });
      } else {
        set({ location: null, locationSettings: null, resources: null });
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      set({ location: null, locationSettings: null, resources: null });
    }
  },
}));

export default useDashboardStore;

// import { create } from "zustand";
// import { api } from "@/trpc/server";

// import type { Location, LocationSetting, Resource } from "@/server/db/types";

// type DashboardState = {
//   location: Location | null;
//   locationSettings: LocationSetting | null;
//   resources: Resource[] | null;
//   fetchLocation: () => Promise<void>;
//   fetchLocationById: (locationId: string) => Promise<void>;
//   fetchLocationSettings: (locationId: string) => Promise<void>;
//   fetchResources: (locationId: string) => Promise<void>;
//   fetchLocationData: () => Promise<void>;
// };

// const useDashboardStore = create<DashboardState>((set) => ({
//   location: null,
//   locationSettings: null,
//   resources: null,
//   fetchLocation: async () => {
//     const location = await api.location.getLocationByUserId.query();
//     set({ location });
//   },
//   fetchLocationById: async (locationId: string) => {
//     const location = await api.location.getLocationById.query({
//       id: locationId,
//     });
//     set({ location });
//   },
//   fetchLocationSettings: async (locationId: string) => {
//     const locationSettings =
//       await api.location.getLocationSettingsByLocationId.query({
//         locationId,
//       });
//     set({ locationSettings });
//   },
//   fetchResources: async (locationId: string) => {
//     const resources = await api.resource.getResourcesByLocationId.query({
//       locationId,
//     });
//     set({ resources });
//   },
//   fetchLocationData: async () => {
//     try {
//       const location = await api.location.getLocationByUserId.query();
//       if (location) {
//         const [locationSettings, resources] = await Promise.all([
//           api.location.getLocationSettingsByLocationId.query({
//             locationId: location.id,
//           }),
//           api.resource.getResourcesByLocationId.query({
//             locationId: location.id,
//           }),
//         ]);
//         set({ location, locationSettings, resources });
//       } else {
//         set({ location: null, locationSettings: null, resources: null });
//       }
//     } catch (error) {
//       console.error("Error fetching location data:", error);
//       set({ location: null, locationSettings: null, resources: null });
//     }
//   },
// }));

// export default useDashboardStore;
