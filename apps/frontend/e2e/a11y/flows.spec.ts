import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("flow: open Projects and see list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /projects/i }).first().click();
  await expect(page).toHaveURL(/\/projects/);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .disableRules([
    "color-contrast",
    "region",
    "button-name",
    "heading-order",
    "link-in-text-block",
    "aria-progressbar-name",
    "scrollable-region-focusable",
  ])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("flow: open Settings and reach a subpage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /settings/i }).first().click();
  await expect(page).toHaveURL(/\/settings/);
  await page.getByRole("link", { name: /appearance/i }).click();
  await expect(page).toHaveURL(/\/settings\/appearance/);
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .disableRules([
    "color-contrast",
    "region",
    "button-name",
    "heading-order",
    "link-in-text-block",
    "aria-progressbar-name",
    "scrollable-region-focusable",
  ])
    .analyze();
  expect(results.violations).toEqual([]);
});
