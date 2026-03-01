import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import Endpoints from "./Endpoints";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            String(url).includes("/projects") ? [] : { data: [], total: 0 }
          ),
      })
    )
  );
});

describe("Endpoints", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<Endpoints />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
