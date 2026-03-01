import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import Bugs from "./Bugs";

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

describe("Bugs", () => {
  it("should have no accessibility violations", { timeout: 10000 }, async () => {
    const { container } = render(<Bugs />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
