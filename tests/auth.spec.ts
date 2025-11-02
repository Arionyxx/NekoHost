import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display sign in and sign up buttons when not authenticated", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("should navigate to sign-in page", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await expect(page).toHaveURL("/auth/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("should navigate to sign-up page", async ({ page }) => {
    await page.getByRole("button", { name: /sign up/i }).first().click();
    await expect(page).toHaveURL("/auth/sign-up");
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
  });

  test("should show validation errors on sign-in form", async ({ page }) => {
    await page.goto("/auth/sign-in");

    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("should show validation errors on sign-up form", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page.getByText(/display name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("should validate password confirmation on sign-up", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.getByLabel(/display name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("different123");

    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test("should navigate to password reset page", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByRole("link", { name: /forgot password/i }).click();

    await expect(page).toHaveURL("/auth/reset");
    await expect(
      page.getByRole("heading", { name: /reset password/i })
    ).toBeVisible();
  });

  test("should show validation on password reset form", async ({ page }) => {
    await page.goto("/auth/reset");

    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test("should have links between auth pages", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/auth/sign-up");

    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/auth/sign-in");
  });
});
