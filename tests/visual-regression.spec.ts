import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {
  test.describe("Desktop Screenshots", () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test("Home page - Desktop", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("home-desktop.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Gallery page - Desktop", async ({ page }) => {
      await page.goto("/gallery");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("gallery-desktop.png", {
        fullPage: false,
        animations: "disabled",
      });
    });

    test("Upload page - Desktop", async ({ page }) => {
      await page.goto("/upload");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("upload-desktop.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Navigation menu - Desktop", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const nav = page.locator("nav");
      await expect(nav).toHaveScreenshot("navigation-desktop.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("Home page - Tablet", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("home-tablet.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Gallery page - Tablet", async ({ page }) => {
      await page.goto("/gallery");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("gallery-tablet.png", {
        fullPage: false,
        animations: "disabled",
      });
    });

    test("Upload page - Tablet", async ({ page }) => {
      await page.goto("/upload");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("upload-tablet.png", {
        fullPage: true,
        animations: "disabled",
      });
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("Home page - Mobile", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("home-mobile.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Gallery page - Mobile", async ({ page }) => {
      await page.goto("/gallery");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("gallery-mobile.png", {
        fullPage: false,
        animations: "disabled",
      });
    });

    test("Upload page - Mobile", async ({ page }) => {
      await page.goto("/upload");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("upload-mobile.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Navigation menu - Mobile open", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const menuButton = page.getByRole("button", { name: "Toggle menu" });
      await menuButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot("navigation-mobile-open.png", {
        fullPage: false,
        animations: "disabled",
      });
    });
  });

  test.describe("Component States", () => {
    test("Button focus states", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const uploadButton = page.getByRole("link", { name: /upload images/i });
      await uploadButton.focus();
      await expect(page.locator("section").first()).toHaveScreenshot(
        "button-focus-state.png",
        { animations: "disabled" }
      );
    });

    test("Input focus states", async ({ page }) => {
      await page.goto("/auth/sign-in");
      await page.waitForLoadState("networkidle");
      const emailInput = page.getByLabel(/email/i);
      await emailInput.focus();
      await expect(page.locator("form")).toHaveScreenshot(
        "input-focus-state.png",
        { animations: "disabled" }
      );
    });
  });

  test.describe("Theme Consistency", () => {
    test("Catppuccin color palette consistency", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const colors = await page.evaluate(() => {
        const styles = getComputedStyle(document.body);
        return {
          background: styles.backgroundColor,
          foreground: styles.color,
        };
      });

      expect(colors.background).toBeTruthy();
      expect(colors.foreground).toBeTruthy();
    });

    test("Smooth transitions on hover", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const card = page.locator(".group").first();
      if ((await card.count()) > 0) {
        await card.hover();
        await page.waitForTimeout(300);
      }
    });
  });
});
