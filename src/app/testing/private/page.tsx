"use client";

import { api } from "@/trpc/react";
import React from "react";

function page() {
  const getProtectedTest = api.test.getProtectedTest.useQuery();

  if (getProtectedTest.isSuccess) {
    return (
      <>
        <h1>It worked!</h1>
        {getProtectedTest.data}
      </>
    );
  }

  return (
    <>
      <h1>It failed!</h1>
    </>
  );
}

export default page;
