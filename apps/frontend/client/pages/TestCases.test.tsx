import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import TestCases from "./TestCases";

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

describe("TestCases", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<TestCases />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
