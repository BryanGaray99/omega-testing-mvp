/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Keep this config for potential future end-to-end suites.
  // Currently the a11y suites (e2e/a11y/**) are disabled.
  testIgnore: ["a11y/**", "lighthouse/**"],
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Important: we do not define webServer.
  // We assume the frontend is already running at http://localhost:5173
  // (for example, started by omega-testing).
});
