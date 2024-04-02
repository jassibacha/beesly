import { expect, test } from "@playwright/test";

test.describe("Dashboard pages", () => {
  test("Hit the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Wait until Daily Bookings is visible
    await expect(page.getByText("Daily Bookings")).toBeVisible();

    // Wait for the "Loading..." text to disappear
    await page.waitForSelector('text="Loading time slots"', {
      state: "hidden",
    });
  });
  test("View Bookings", async ({ page }) => {
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
});
