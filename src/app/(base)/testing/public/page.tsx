"use client";

import { api } from "@/trpc/react";
import React from "react";

function page() {
  const getTest = api.test.getTest.useQuery();

  if (getTest.isSuccess) {
    return (
      <>
        <h1>It worked!</h1>
        {getTest.data}
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
