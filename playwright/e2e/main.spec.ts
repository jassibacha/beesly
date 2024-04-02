import { expect, test } from "@playwright/test";

test.describe("Static pages", () => {
  test("Hit the homepage", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Effortlessly optimize your VR bookings",
      }),
    ).toBeVisible();

    //await percySnapshot(page, "Homepage");
  });

  // We're already signed in now automatically because of auth.setup.ts
  // test("Sign in page", async ({ page }) => {
  //   await page.goto("/sign-in");

  //   await expect(page.getByText("Sign in")).toBeVisible();

  //   //await percySnapshot(page, "Sign in");
  // });
});

// test.describe("User authentication", () => {
//   test("Sign in", async ({ page }) => {
//     await page.goto("/sign-in");

//     await page.fill('input[name="identifier"]', "xxx");
//     await page.getByRole("button", { name: "Continue", exact: true }).click();
//     //await page.click('button[class="cl-formButtonPrimary"]');
//     //await page.click('button[type="submit"]');

//     await page.fill('input[name="password"]', "xxx");
//     await page.getByRole("button", { name: "Continue", exact: true }).click();
//     //await page.click('button[class="cl-formButtonPrimary"]');
//     //await page.waitForNavigation();

//     await expect(page).toHaveURL("/dashboard");
//   });
// });
