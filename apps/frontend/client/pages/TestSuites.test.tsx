import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import TestSuites from "./TestSuites";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    )
  );
});

describe("TestSuites", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<TestSuites />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
