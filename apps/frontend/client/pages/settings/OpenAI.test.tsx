import { describe, it, expect } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import OpenAISettings from "./OpenAI";

describe("OpenAISettings", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<OpenAISettings />);
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
