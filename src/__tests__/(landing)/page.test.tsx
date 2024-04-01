import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/(landing)/page";

test("Landing Homepage", () => {
  render(<Home />);
  const heading = screen.getByRole("heading", {
    name: /Effortlessly optimize your VR bookings/i,
  });
  expect(heading).toBeDefined();
  // expect(
  //   screen.getByRole("heading", {
  //     level: 1,
  //     name: "Effortlessly optimize your VR bookings",
  //   }),
  // ).toBeDefined();
});
