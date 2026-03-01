import { chromium } from "playwright";
import type { Browser } from "playwright";
import { test as base } from "@playwright/test";
import getPort from "get-port";

type LighthouseFixtures = {
  port: number;
  browser: Browser;
};

export const lighthouseTest = base.extend<{}, LighthouseFixtures>({
  port: [
    async ({}, use) => {
      const port = await getPort();
      await use(port);
    },
    { scope: "worker" },
  ],

  browser: [
    async ({ port }, use) => {
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`],
      });
      await use(browser);
    },
    { scope: "worker" },
  ],
});
