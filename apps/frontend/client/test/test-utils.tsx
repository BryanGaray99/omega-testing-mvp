import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ExecutionProvider } from "@/contexts/ExecutionContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { axe } from "vitest-axe";
import type { RunOptions } from "axe-core";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ExecutionProvider>
            <TooltipProvider>
              <MemoryRouter>{children}</MemoryRouter>
            </TooltipProvider>
          </ExecutionProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: AllProviders,
    ...options,
  });
}

/**
 * Run axe a11y audit with the same baseline rules disabled as in end-to-end (Playwright)
 * (e.g. heading-order) so unit tests pass while still checking other a11y rules.
 */
export async function runA11yAudit(container: HTMLElement, options?: RunOptions) {
  return axe(container, {
    rules: {
      "heading-order": { enabled: false },
      ...options?.rules,
    },
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
