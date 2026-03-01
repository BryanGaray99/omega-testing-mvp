import { describe, it, expect } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import DangerZoneSettings from "./DangerZone";

describe("DangerZoneSettings", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<DangerZoneSettings />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
