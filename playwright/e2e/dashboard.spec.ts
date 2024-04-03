import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("Main Dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Wait until Daily Bookings is visible
    //await expect(page.getByText("Daily Bookings")).toBeVisible();
    await page.waitForSelector('text="Daily Bookings"', {
      state: "visible",
      timeout: 10000, // Increase timeout to 10 seconds
    });

    // Wait for the "Loading time slots" text to disappear
    await page.waitForSelector('text="Loading time slots"', {
      state: "hidden",
      timeout: 10000, // Increase timeout to 10 seconds
    });
  });
  test("Bookings Page", async ({ page }) => {
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
  test("Settings Page", async ({ page }) => {
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

    // Find General Settings subheading, confirm we're there.
    await expect(
      page.getByRole("heading", { name: "General Settings", exact: true }),
    ).toBeVisible();

    // Locate the business name label
    await page.waitForSelector('text="Business Name"', { state: "visible" });

    await page.waitForSelector('button:has-text("Advanced Settings")', {
      state: "visible",
    });
    await page.click('button:has-text("Advanced Settings")');
    // Find Advanced Settings subheading, confirm we're there.
    await expect(
      page.getByRole("heading", { name: "Advanced Settings", exact: true }),
    ).toBeVisible();

    // Locate the text Monday
    await page.waitForSelector('text="Monday"', { state: "visible" });
  });
});
