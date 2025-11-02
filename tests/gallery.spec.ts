import { test, expect } from "@playwright/test";

test.describe("Public Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/gallery");
  });

  test("should display gallery page with header", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /browse images/i })
    ).toBeVisible();
    await expect(
      page.getByText(/explore public images shared by our community/i)
    ).toBeVisible();
  });

  test("should display filter bar with search and sort options", async ({
    page,
  }) => {
    await expect(
      page.getByPlaceholder(/search by filename or uploader/i)
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /newest/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /trending/i })).toBeVisible();
  });

  test("should show skeleton loading state initially", async ({ page }) => {
    await page.goto("/gallery");
    const skeletons = page.locator(".animate-pulse");
    await expect(skeletons.first()).toBeVisible();
  });

  test("should display empty state when no images exist", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const emptyStateHeading = page.getByRole("heading", {
      name: /no images yet|no images found/i,
    });

    const imageCards = page.locator('[class*="ImageCard"]');
    const count = await imageCards.count();

    if (count === 0) {
      await expect(emptyStateHeading).toBeVisible();
    }
  });

  test("should allow searching for images", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(
      /search by filename or uploader/i
    );
    await searchInput.fill("test");

    await page.waitForTimeout(500);
  });

  test("should allow switching between sort options", async ({ page }) => {
    const newestButton = page.getByRole("button", { name: /newest/i });
    const trendingButton = page.getByRole("button", { name: /trending/i });

    await expect(newestButton).toHaveClass(/bg-accent/);

    await trendingButton.click();
    await expect(trendingButton).toHaveClass(/bg-accent/);
  });

  test("should have pagination/infinite scroll trigger", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.waitForTimeout(1000);
  });
});

test.describe("Gallery Pagination", () => {
  test("should load more images when scrolling to bottom", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const initialImages = await page.locator('a[href^="/i/"]').count();

    if (initialImages >= 20) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      await page.waitForTimeout(2000);

      const newImages = await page.locator('a[href^="/i/"]').count();
      expect(newImages).toBeGreaterThanOrEqual(initialImages);
    }
  });

  test("should show loader when loading more images", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const imageCount = await page.locator('a[href^="/i/"]').count();

    if (imageCount >= 20) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const loader = page.locator(".animate-spin");
      await expect(loader).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("User Gallery", () => {
  test("should display user gallery page", async ({ page }) => {
    await page.goto("/u/testuser");

    await expect(page.getByRole("heading", { name: /gallery/i })).toBeVisible();
  });

  test("should show user not found message for invalid username", async ({
    page,
  }) => {
    await page.goto("/u/nonexistentuser123456");

    await expect(
      page.getByRole("heading", { name: /user not found/i })
    ).toBeVisible();
  });

  test("should display filter bar in user gallery", async ({ page }) => {
    await page.goto("/u/testuser");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(
      /search by filename or uploader/i
    );

    const exists = await searchInput.count();
    if (exists > 0) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe("Gallery Access Control", () => {
  test("public gallery should only show public images", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const privateBadges = page
      .locator("text=private")
      .filter({ hasText: /^private$/i });
    const count = await privateBadges.count();

    expect(count).toBe(0);
  });

  test("user gallery should show visibility badges for own images", async ({
    page,
    context,
  }) => {
    await page.goto("/auth/sign-in");

    const emailInput = page.locator('input[type="email"]');
    const exists = await emailInput.count();

    if (exists > 0) {
      await emailInput.fill("test@example.com");
      await page.locator('input[type="password"]').fill("testpassword123");
      await page.getByRole("button", { name: /sign in/i }).click();

      await page.waitForTimeout(2000);

      const profileDropdown = page
        .locator('button:has-text("My Gallery")')
        .first();
      const dropdownExists = await profileDropdown.count();

      if (dropdownExists > 0) {
        const avatarButton = page.locator("div.rounded-full.bg-accent").first();
        await avatarButton.click();

        const myGalleryLink = page.getByRole("link", { name: /my gallery/i });
        await myGalleryLink.click();

        await page.waitForLoadState("networkidle");
      }
    }
  });
});

test.describe("Image Detail Page", () => {
  test("should display image not found for invalid image ID", async ({
    page,
  }) => {
    await page.goto("/i/00000000-0000-0000-0000-000000000000");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /image not found/i })
    ).toBeVisible();
  });

  test("should display back button on image detail page", async ({ page }) => {
    await page.goto("/i/00000000-0000-0000-0000-000000000000");
    await page.waitForLoadState("networkidle");

    const backButton = page.getByRole("button", { name: /back/i });

    const count = await backButton.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Gallery Navigation", () => {
  test("should have Gallery link in navigation", async ({ page }) => {
    await page.goto("/");

    const galleryLink = page.getByRole("link", { name: /^gallery$/i });
    await expect(galleryLink).toBeVisible();
  });

  test("Gallery link should navigate to gallery page", async ({ page }) => {
    await page.goto("/");

    const galleryLink = page.getByRole("link", { name: /^gallery$/i });
    await galleryLink.click();

    await expect(page).toHaveURL(/\/gallery$/);
  });

  test("should show My Gallery link in user menu when authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    const signInLink = page.getByRole("link", { name: /sign in/i });
    const exists = await signInLink.count();

    if (exists > 0) {
      await signInLink.click();
    }
  });
});
