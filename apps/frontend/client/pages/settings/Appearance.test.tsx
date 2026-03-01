import { describe, it, expect } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import AppearanceSettings from "./Appearance";

describe("AppearanceSettings", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<AppearanceSettings />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
