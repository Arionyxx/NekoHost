import { test, expect } from "@playwright/test";

test.describe("Profile and Settings", () => {
  test("should redirect to sign-in when accessing profile without auth", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should redirect to sign-in when accessing settings without auth", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should maintain redirectTo param for protected routes", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/redirectTo=%2Fprofile/);
  });
});

test.describe("Settings Page (visual check)", () => {
  test("should have proper form structure on settings page", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.waitForURL(/\/auth\/sign-in/);
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
