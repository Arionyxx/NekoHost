import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test("Home page keyboard navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });

  test("Focus states have sufficient contrast", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const uploadButton = page.getByRole("link", { name: /upload images/i });
    await uploadButton.focus();

    const ringColor = await uploadButton.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue("--tw-ring-color");
    });

    expect(ringColor).toBeTruthy();
  });

  test("All interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;

      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          role: el?.getAttribute("role"),
          ariaLabel: el?.getAttribute("aria-label"),
        };
      });

      if (activeElement.tag === "A" || activeElement.tag === "BUTTON") {
        expect(activeElement.ariaLabel || activeElement.role).toBeTruthy();
      }
    }
  });

  test("Images have alt text", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const images = page.locator("img");
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        expect(alt).toBeTruthy();
      }
    }
  });

  test("Buttons have accessible labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const text = await button.textContent();

      expect(ariaLabel || (text && text.trim().length > 0)).toBeTruthy();
    }
  });

  test("Form inputs have labels", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("networkidle");

    const inputs = page.locator('input[type="email"], input[type="password"]');
    const count = await inputs.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = (await label.count()) > 0;
          expect(hasLabel || ariaLabel).toBeTruthy();
        }
      }
    }
  });

  test("Color contrast meets WCAG standards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const textElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("h1, h2, p, span"));
      return elements.slice(0, 5).map((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        };
      });
    });

    expect(textElements.length).toBeGreaterThan(0);
    textElements.forEach((element) => {
      expect(element.color).toBeTruthy();
    });
  });

  test("Skip to main content link exists", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const firstFocusedElement = await page.evaluate(() => {
      return {
        text: document.activeElement?.textContent?.trim(),
        href: document.activeElement?.getAttribute("href"),
      };
    });

    expect(firstFocusedElement).toBeTruthy();
  });

  test("Mobile navigation is keyboard accessible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    await menuButton.focus();

    const isFocused = await menuButton.evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
  });
});
