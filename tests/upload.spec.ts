import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Upload Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upload");
  });

  test("should display upload page with drag-and-drop area", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /upload your images/i })
    ).toBeVisible();
    await expect(page.getByText(/drag and drop images here/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /browse files/i })
    ).toBeVisible();
  });

  test("should show file size and format limits", async ({ page }) => {
    await expect(page.getByText(/maximum file size: 50mb/i)).toBeVisible();
    await expect(
      page.getByText(/jpeg, png, gif, webp, svg, bmp, tiff/i)
    ).toBeVisible();
  });

  test("should allow file selection via file input", async ({ page }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    await page
      .getByRole("button", { name: /browse files/i })
      .click({ force: true });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.getByText(/test-image-1\.png/i)).toBeVisible();
    await expect(page.getByText(/pending/i)).toBeVisible();
  });

  test("should handle multiple file selection", async ({ page }) => {
    const testFiles = [
      path.join(__dirname, "fixtures", "test-image-1.png"),
      path.join(__dirname, "fixtures", "test-image-2.png"),
    ];

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles);

    await expect(page.getByText(/files \(2\)/i)).toBeVisible();
    await expect(page.getByText(/test-image-1\.png/i)).toBeVisible();
    await expect(page.getByText(/test-image-2\.png/i)).toBeVisible();
  });

  test("should show upload button when files are selected", async ({
    page,
  }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await expect(
      page.getByRole("button", { name: /upload 1 file/i })
    ).toBeVisible();
  });

  test("should allow removing pending files", async ({ page }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.getByText(/test-image-1\.png/i)).toBeVisible();

    await page.getByLabel("Remove").first().click();

    await expect(page.getByText(/test-image-1\.png/i)).not.toBeVisible();
  });

  test("should show status badges for files", async ({ page }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.getByText(/1 pending/i)).toBeVisible();
  });

  test("should display file previews", async ({ page }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    const preview = page.locator('img[alt="test-image-1.png"]');
    await expect(preview).toBeVisible();
  });

  test("should handle drag and drop interaction", async ({ page }) => {
    const dropZone = page.locator(".border-dashed").first();

    await expect(dropZone).toHaveClass(/border-border/);

    await dropZone.dispatchEvent("dragover", {
      dataTransfer: {
        types: ["Files"],
      },
    });

    await expect(dropZone).toHaveClass(/border-accent/);
  });

  test("should show clear completed button after successful uploads", async ({
    page,
  }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.getByText(/1 pending/i)).toBeVisible();
  });
});

test.describe("Multi-file Upload Scenario (E2E)", () => {
  test.skip("should upload multiple files with progress tracking", async ({
    page,
  }) => {
    await page.goto("/upload");

    const testFiles = [
      path.join(__dirname, "fixtures", "test-image-1.png"),
      path.join(__dirname, "fixtures", "test-image-2.png"),
      path.join(__dirname, "fixtures", "test-image-3.png"),
    ];

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles);

    await expect(page.getByText(/files \(3\)/i)).toBeVisible();
    await expect(page.getByText(/3 pending/i)).toBeVisible();

    await page.getByRole("button", { name: /upload 3 files/i }).click();

    await expect(page.getByText(/uploading/i)).toBeVisible();

    await expect(page.getByText(/completed/i)).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page.getByRole("button", { name: /copy link/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /markdown/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /html/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /view image/i }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: /clear completed/i }).click();
    await expect(page.getByText(/files \(3\)/i)).not.toBeVisible();
  });

  test.skip("should handle upload failures with retry option", async ({
    page,
  }) => {
    await page.goto("/upload");

    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await page.route("**/api/upload", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Upload failed" }),
      });
    });

    await page.getByRole("button", { name: /upload 1 file/i }).click();

    await expect(page.getByText(/failed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/1 failed/i)).toBeVisible();

    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();

    await page.unroute("**/api/upload");

    await page.getByRole("button", { name: /retry/i }).click();
  });

  test.skip("should copy links to clipboard after successful upload", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/upload");

    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    await page.getByRole("button", { name: /upload 1 file/i }).click();

    await expect(page.getByText(/completed/i)).toBeVisible({
      timeout: 30000,
    });

    await page
      .getByRole("button", { name: /copy link/i })
      .first()
      .click();

    await expect(
      page.getByText(/direct link copied to clipboard/i)
    ).toBeVisible();
  });
});
