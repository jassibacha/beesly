"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import type { User } from "@/server/db/types";

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const defaultContext: UserContextType = {
  user: null,
  setUser: () => null,
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  //console.log("UserProvider firing");
  const [user, setUser] = useState<User | null>(null);

  const { refetch: refetchUser, isLoading } = api.user.syncUser.useQuery(
    undefined,
    {
      onSuccess: (syncedUser) => {
        console.log("onSuccess", syncedUser);
        if (syncedUser) {
          setUser(syncedUser);
          // If user has not been onboarded, redirect to setup
          if (!syncedUser.onboarded) {
            redirect("/dashboard/setup");
          }
        } else {
          //console.log("No user, redirecting to sign-in");
          redirect("/sign-in");
        }
      },
      enabled: !user, // Enable the query only if there is no user set
    },
  );

  useEffect(() => {
    //console.log("useEffect firing");
    // Refetch the user on component mount or when the user state is null and not loading
    if (!user && !isLoading) {
      console.log("Refetching user");
      void refetchUser();
    }
  }, [user, isLoading, refetchUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
