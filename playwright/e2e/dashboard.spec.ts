import { expect, test } from "@playwright/test";

test.describe("Dashboard pages", () => {
  test("Dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Wait until Daily Bookings is visible
    await expect(page.getByText("Daily Bookings")).toBeVisible();

    // Wait for the "Loading time slots" text to disappear
    await page.waitForSelector('text="Loading time slots"', {
      state: "hidden",
    });
  });
  test("Bookings", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    // Wait until Bookings is visible
    await expect(
      page.getByRole("heading", { name: "Bookings", exact: true }),
    ).toBeVisible();
    // Get the two component headings as well
    await expect(
      page.getByRole("heading", { name: "Upcoming Bookings" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Bookings" }),
    ).toBeVisible();
    // Wait for the "Loading..." text to disappear
    await page.waitForSelector('text="Loading..."', { state: "hidden" });
  });
  test("Settings", async ({ page }) => {
    // Temp load to try and pull in location data into LocationContext
    await page.goto("/dashboard");
    // Wait for the "Loading time slots" text to disappear
    await page.waitForSelector('text="Loading time slots"', {
      state: "hidden",
    });
    await page.goto("/dashboard/settings");
    // Wait until main Settings heading is visible
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();

    // Find General Settings subheading
    await expect(
      page.getByRole("heading", { name: "General Settings", exact: true }),
    ).toBeVisible();
  });
});
