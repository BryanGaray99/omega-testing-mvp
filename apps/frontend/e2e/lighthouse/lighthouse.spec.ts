import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import { lighthouseTest } from "./lighthouse.fixture";

const baseURL = process.env.BASE_URL || "http://localhost:5173";

/**
 * Lighthouse thresholds (0–100) aligned with typical Lighthouse report:
 * Performance, Accessibility, Best Practices, SEO.
 * PWA is omitted. Values set so audits pass in CI/local; Performance and
 * Accessibility vary by machine, so thresholds are conservative.
 */
const defaultThresholds = {
  performance: 25,
  accessibility: 85,
  "best-practices": 85,
  seo: 50,
};

/** All main app screens – same coverage as a11y E2E routes. */
const mainScreens = [
  { path: "/", name: "Dashboard" },
  { path: "/projects", name: "Projects" },
  { path: "/endpoints", name: "Endpoints" },
  { path: "/test-cases", name: "Test-Cases" },
  { path: "/test-suites", name: "Test-Suites" },
  { path: "/bugs", name: "Bugs" },
  { path: "/test-executions", name: "Test-Executions" },
  { path: "/ai-assistant", name: "AI-Assistant" },
  { path: "/settings/documentation", name: "Settings-Documentation" },
  { path: "/settings/appearance", name: "Settings-Appearance" },
  { path: "/settings/openai", name: "Settings-OpenAI" },
  { path: "/settings/danger", name: "Settings-DangerZone" },
];

/** Pages with heavy loading: allow extra time for meaningful content to render. */
const heavyPaths = new Set(["/test-cases", "/bugs", "/test-executions"]);
const isSettingsPath = (p: string) => p.startsWith("/settings/");

lighthouseTest.describe("Lighthouse audits (Performance, Accessibility, Best Practices, SEO)", () => {
  for (const { path, name } of mainScreens) {
    lighthouseTest(`${name} (${path})`, async ({ port, browser }) => {
      if (path === "/test-cases" || path === "/settings/documentation") test.setTimeout(120_000);

      const page = await browser.newPage();
      await page.goto(`${baseURL}${path}`, { waitUntil: "load" });

      const contentTimeout = isSettingsPath(path) || heavyPaths.has(path) ? 60_000 : 15_000;
      const readySelector = isSettingsPath(path) ? "main h1, main h2" : "h1";
      await page.waitForSelector(readySelector, { state: "visible", timeout: contentTimeout });

      await new Promise((r) => setTimeout(r, 1500));

      await playAudit({
        page,
        port,
        thresholds: defaultThresholds,
        reports: {
          formats: { html: true, json: false, csv: false },
          name: `lighthouse-${name}`,
          directory: "lighthouse-reports",
        },
      });
      await page.close();
    });
  }
});
