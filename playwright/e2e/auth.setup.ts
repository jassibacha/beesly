import { test as setup, expect } from "@playwright/test";

// https://playwright.dev/docs/auth
//
const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Perform clerk authentication steps.
  await page.goto("/sign-in");
  await page.fill('input[name="identifier"]', "klikster@gmail.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.fill('input[name="password"]', "testPass22");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("/dashboard");
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByText("Daily Bookings")).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
