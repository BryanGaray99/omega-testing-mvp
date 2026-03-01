import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";
import "@testing-library/jest-dom/vitest";

expect.extend(matchers);

// jsdom does not implement matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
