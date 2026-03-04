/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:5173";

/**
 * Playwright config for Lighthouse audits only.
 * Runs with a single worker so the Lighthouse debugging port does not conflict.
 * Use: npm run test:lighthouse
 * To run against a build (e.g. app served on port 5000): BASE_URL=http://localhost:5000 npm run test:lighthouse
 */
export default defineConfig({
  testDir: "./e2e/lighthouse",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/frontend-lighthouse-results.json" }],
  ],
  use: {
    baseURL,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // No webServer: we assume the frontend is already served at baseURL.
});
