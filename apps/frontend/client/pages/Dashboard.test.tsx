import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import Dashboard from "./Dashboard";

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

describe("Dashboard", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<Dashboard />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
