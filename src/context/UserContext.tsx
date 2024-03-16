"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/trpc/react";
import type { User } from "@/server/db/types";
import type { QueryObserverResult } from "@tanstack/react-query";

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  refetch: () => Promise<QueryObserverResult<User | null | undefined, unknown>>;
};

const defaultContext: UserContextType = {
  user: null,
  setUser: () => null,
  isLoading: false,
  refetch: async () =>
    ({}) as QueryObserverResult<User | null | undefined, unknown>,
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Sync the user from clerk to the server
  const { refetch, isLoading } = api.user.syncUser.useQuery(undefined, {
    onSettled: (syncedUser) => {
      if (syncedUser) {
        setUser(syncedUser); // Set the user in the context if we get a valid user object
      }
    },
    enabled: !user, // Enable the query only if there is no user set
  });

  useEffect(() => {
    // Refetch the user data if the user is not set and the query is not already loading
    if (!user && !isLoading) {
      void refetch();
    }
  }, [user, isLoading, refetch]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, refetch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useDashboardUser = () => useContext(UserContext);
