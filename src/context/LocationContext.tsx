"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { api } from "@/trpc/react";
import type { Location, LocationSetting, Resource } from "@/server/db/types";
import type { QueryObserverResult } from "@tanstack/react-query";

export type LocationContextType = {
  location: Location | null;
  setLocation: (location: Location | null) => void;
  locationSettings: LocationSetting | null;
  setSettings: (locationSettings: LocationSetting | null) => void;
  resources: Resource[] | null;
  setResources: (resources: Resource[] | null) => void;
  isLoading: boolean;
  refetchLocation: () => Promise<
    QueryObserverResult<Location | null | undefined, unknown>
  >;
  refetchSettings: () => Promise<
    QueryObserverResult<LocationSetting | null | undefined, unknown>
  >;
  refetchResources: () => Promise<
    QueryObserverResult<Resource[] | null | undefined, unknown>
  >;
  refetchAll: () => Promise<void>; // void
};

const defaultContext: LocationContextType = {
  location: null,
  setLocation: () => null,
  locationSettings: null,
  setSettings: () => null,
  resources: null,
  setResources: () => null,
  isLoading: false,
  refetchLocation: async () =>
    ({}) as QueryObserverResult<Location | null | undefined, unknown>,
  refetchSettings: async () =>
    ({}) as QueryObserverResult<LocationSetting | null | undefined, unknown>,
  refetchResources: async () =>
    ({}) as QueryObserverResult<Resource[] | null | undefined, unknown>,
  refetchAll: async () => {
    return Promise.resolve();
  },
};

export const LocationContext =
  createContext<LocationContextType>(defaultContext);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationSettings, setSettings] = useState<LocationSetting | null>(
    null,
  );
  const [resources, setResources] = useState<Resource[] | null>(null);

  const [locationId, setLocationId] = useState<string | null>(null);

  // Update locationId whenever location changes
  useEffect(() => {
    if (location?.id && location?.id !== locationId) {
      setLocationId(location.id);
    }
  }, [location, locationId]);

  // Grab the location from the db and set it
  const { refetch: refetchLocation, isLoading: isLoadingLocation } =
    api.location.getLocationByUserId.useQuery(undefined, {
      onSettled: (data) => {
        if (data) {
          // Set the location in the context if we get a valid object
          setLocation(data);
        }
      },
      // Enable the query only if there is no location set
      enabled: !location,
    });

  //if (location && location.id) {
  // Grab the location settings from the db and set them
  const { refetch: refetchSettings, isLoading: isLoadingSettings } =
    api.location.getLocationSettingsByLocationId.useQuery(
      { locationId: locationId ?? "" },
      {
        onSettled: (data) => {
          if (data) {
            // Set the locationSettings in the context if we get a valid object
            setSettings(data);
          }
        },
        // Enable the query only if there is a locationId set and no settings set
        enabled: !!locationId && !locationSettings,
      },
    );

  // Grab the resources from the db and set them
  const { refetch: refetchResources, isLoading: isLoadingResources } =
    api.resource.getResourcesByLocationId.useQuery(
      { locationId: locationId ?? "" },
      {
        onSettled: (data) => {
          if (data) {
            // Set the resources in the context if we get a valid object
            setResources(data);
          }
        },
        // Enable the query only if there is a locationId set and no resources set
        enabled: !!locationId && !resources,
      },
    );
  //}

  // useEffect(() => {
  //   console.log("LocationContext: useEffect");
  //   if (!location && !isLoadingLocation) {
  //     void refetchLocation();
  //   }
  // }, [location, isLoadingLocation, refetchLocation]);

  const isLoading = useMemo(
    () => isLoadingLocation || isLoadingSettings || isLoadingResources,
    [isLoadingLocation, isLoadingSettings, isLoadingResources],
  );

  const refetchAll = async (): Promise<void> => {
    console.log("LocationContext: refetchAll");
    // Run these void in parallel
    void refetchLocation();
    void refetchSettings();
    void refetchResources();
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        refetchLocation,
        locationSettings,
        setSettings,
        refetchSettings,
        resources,
        setResources,
        refetchResources,
        isLoading,
        refetchAll,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
