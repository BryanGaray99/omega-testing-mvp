import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  { path: "/", name: "Dashboard" },
  { path: "/projects", name: "Projects" },
  { path: "/settings/documentation", name: "Settings Documentation" },
  { path: "/settings/appearance", name: "Settings Appearance" },
  { path: "/settings/openai", name: "Settings OpenAI" },
  { path: "/settings/danger", name: "Settings Danger Zone" },
  { path: "/endpoints", name: "Endpoints" },
  { path: "/test-cases", name: "Test Cases" },
  { path: "/test-suites", name: "Test Suites" },
  { path: "/bugs", name: "Bugs" },
  { path: "/test-executions", name: "Test Executions" },
  { path: "/ai-assistant", name: "AI Assistant" },
];

for (const { path, name } of routes) {
  test(`${name} (${path}) should have no accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
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
}
