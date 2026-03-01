import { describe, it, expect } from "vitest";
import { render, runA11yAudit } from "@/test/test-utils";
import Layout from "./Layout";

describe("Layout", () => {
  it("should have no accessibility violations", { timeout: 10000 }, async () => {
    const { container } = render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );
    const results = await runA11yAudit(container);
    expect(results).toHaveNoViolations();
  });
});
