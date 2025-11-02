import { test, expect } from "@playwright/test";

test.describe("Image Detail Page", () => {
  test.describe("Share Buttons", () => {
    test.skip("should display all share buttons", async ({ page }) => {
      // This test requires a real image to exist
      // Skip for now as it needs database setup
      await page.goto("/i/test-image-id");

      await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /link/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /markdown/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /html/i })).toBeVisible();
    });

    test.skip("should copy direct link to clipboard", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /link/i }).click();

      await expect(
        page.getByText(/direct link copied to clipboard/i)
      ).toBeVisible();
    });

    test.skip("should copy markdown to clipboard", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /markdown/i }).click();

      await expect(
        page.getByText(/markdown copied to clipboard/i)
      ).toBeVisible();
    });

    test.skip("should copy HTML embed to clipboard", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /html/i }).click();

      await expect(
        page.getByText(/html embed copied to clipboard/i)
      ).toBeVisible();
    });

    test.skip("should show tooltip on hover", async ({ page }) => {
      await page.goto("/i/test-image-id");

      const downloadButton = page.getByRole("button", { name: /download/i });
      await downloadButton.hover();

      await expect(page.getByText(/download image/i)).toBeVisible();
    });
  });

  test.describe("Delete Flow", () => {
    test.skip("should show delete button for image owner", async ({ page }) => {
      // This test requires authentication and owning the image
      await page.goto("/i/test-image-id");

      await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
    });

    test.skip("should not show delete button for non-owners", async ({ page }) => {
      // This test requires authentication but not owning the image
      await page.goto("/i/test-image-id");

      await expect(
        page.getByRole("button", { name: /delete/i })
      ).not.toBeVisible();
    });

    test.skip("should show confirmation dialog when clicking delete", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /delete/i }).click();

      await expect(page.getByText(/delete image/i)).toBeVisible();
      await expect(
        page.getByText(/are you sure you want to delete this image/i)
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^delete$/i })
      ).toBeVisible();
    });

    test.skip("should cancel delete when clicking cancel", async ({ page }) => {
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /delete/i }).click();
      await page.getByRole("button", { name: /cancel/i }).click();

      await expect(page.getByText(/delete image/i)).not.toBeVisible();
    });

    test.skip("should delete image and redirect to gallery", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /delete/i }).click();
      await page.getByRole("button", { name: /^delete$/i }).click();

      await expect(
        page.getByText(/image deleted successfully/i)
      ).toBeVisible();

      await expect(page).toHaveURL(/\/gallery/);
    });

    test.skip("should show loading state during deletion", async ({ page }) => {
      await page.goto("/i/test-image-id");

      // Mock slow API response
      await page.route("**/api/images/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });

      await page.getByRole("button", { name: /delete/i }).click();
      await page.getByRole("button", { name: /^delete$/i }).click();

      await expect(page.getByText(/processing/i)).toBeVisible();
    });

    test.skip("should show error message if deletion fails", async ({ page }) => {
      await page.goto("/i/test-image-id");

      await page.route("**/api/images/*", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Deletion failed" }),
        });
      });

      await page.getByRole("button", { name: /delete/i }).click();
      await page.getByRole("button", { name: /^delete$/i }).click();

      await expect(page.getByText(/deletion failed/i)).toBeVisible();
    });
  });

  test.describe("Visibility Toggle", () => {
    test.skip("should show toggle visibility button for owner", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      await expect(
        page.getByRole("button", { name: /toggle visibility/i })
      ).toBeVisible();
    });

    test.skip("should show confirmation dialog when toggling visibility", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /toggle visibility/i }).click();

      await expect(page.getByText(/make image/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /change visibility/i })
      ).toBeVisible();
    });

    test.skip("should update visibility badge after toggle", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      const initialVisibility = await page
        .getByText(/^public$|^private$/i)
        .first()
        .textContent();

      await page.getByRole("button", { name: /toggle visibility/i }).click();
      await page.getByRole("button", { name: /change visibility/i }).click();

      await expect(
        page.getByText(/visibility updated/i)
      ).toBeVisible();

      const newVisibility = await page
        .getByText(/^public$|^private$/i)
        .first()
        .textContent();

      expect(newVisibility).not.toBe(initialVisibility);
    });

    test.skip("should handle visibility toggle error gracefully", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      await page.route("**/api/images/*", (route) => {
        if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: "Update failed" }),
          });
        } else {
          route.continue();
        }
      });

      await page.getByRole("button", { name: /toggle visibility/i }).click();
      await page.getByRole("button", { name: /change visibility/i }).click();

      await expect(page.getByText(/update failed/i)).toBeVisible();
    });
  });

  test.describe("Image Display", () => {
    test.skip("should display image with metadata", async ({ page }) => {
      await page.goto("/i/test-image-id");

      await expect(page.locator("img").first()).toBeVisible();
      await expect(page.getByText(/file size/i)).toBeVisible();
      await expect(page.getByText(/dimensions/i)).toBeVisible();
      await expect(page.getByText(/format/i)).toBeVisible();
      await expect(page.getByText(/uploaded by/i)).toBeVisible();
    });

    test.skip("should display mauve/lavender accents in metadata", async ({
      page,
    }) => {
      await page.goto("/i/test-image-id");

      const metadataLabels = page.locator('p[class*="text-ctp-lavender"]');
      await expect(metadataLabels.first()).toBeVisible();
    });
  });

  test.describe("Access Control", () => {
    test("should show 404 for non-existent images", async ({ page }) => {
      await page.goto("/i/non-existent-image-id");

      await expect(
        page.getByRole("heading", { name: /image not found/i })
      ).toBeVisible();
    });

    test.skip("should show 404 for private images accessed by non-owners", async ({
      page,
    }) => {
      await page.goto("/i/private-image-id");

      await expect(
        page.getByRole("heading", { name: /image not found/i })
      ).toBeVisible();
    });

    test.skip("should allow owner to view private images", async ({ page }) => {
      // Requires authentication as owner
      await page.goto("/i/private-image-id");

      await expect(page.locator("img").first()).toBeVisible();
      await expect(page.getByText(/private/i)).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test.skip("should have back button", async ({ page }) => {
      await page.goto("/i/test-image-id");

      await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
    });

    test.skip("should navigate back when clicking back button", async ({
      page,
    }) => {
      await page.goto("/gallery");
      await page.goto("/i/test-image-id");

      await page.getByRole("button", { name: /back/i }).click();

      await expect(page).toHaveURL(/\/gallery/);
    });

    test.skip("should link to uploader profile", async ({ page }) => {
      await page.goto("/i/test-image-id");

      const uploaderLink = page.getByRole("link", { name: /uploaded by/i });
      await expect(uploaderLink).toBeVisible();
      await expect(uploaderLink).toHaveAttribute("href", /\/u\//);
    });
  });
});

test.describe("Image Detail API Routes", () => {
  test.describe("DELETE /api/images/[id]", () => {
    test.skip("should require authentication", async ({ request }) => {
      const response = await request.delete("/api/images/test-id");
      expect(response.status()).toBe(401);
    });

    test.skip("should verify ownership before deletion", async ({ request }) => {
      // Requires auth token for different user
      const response = await request.delete("/api/images/other-user-image-id");
      expect(response.status()).toBe(403);
    });

    test.skip("should delete image from storage and database", async ({
      request,
    }) => {
      // Requires auth token
      const response = await request.delete("/api/images/test-id");
      expect(response.status()).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
    });
  });

  test.describe("PATCH /api/images/[id]", () => {
    test.skip("should require authentication", async ({ request }) => {
      const response = await request.patch("/api/images/test-id", {
        data: { visibility: "private" },
      });
      expect(response.status()).toBe(401);
    });

    test.skip("should validate visibility value", async ({ request }) => {
      // Requires auth token
      const response = await request.patch("/api/images/test-id", {
        data: { visibility: "invalid" },
      });
      expect(response.status()).toBe(400);
    });

    test.skip("should update visibility successfully", async ({ request }) => {
      // Requires auth token
      const response = await request.patch("/api/images/test-id", {
        data: { visibility: "private" },
      });
      expect(response.status()).toBe(200);

      const json = await response.json();
      expect(json.visibility).toBe("private");
    });
  });
});
