import { describe, it, expect } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import Documentation from "./Documentation";

describe("Documentation", () => {
  it("should have no accessibility violations", { timeout: 45000 }, async () => {
    const { container } = render(<Documentation />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
