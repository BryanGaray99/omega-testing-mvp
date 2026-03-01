import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ExecutionProvider } from "./contexts/ExecutionContext";
import Layout from "./components/Layout";
import SettingsLayout from "./components/SettingsLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
// Temporarily hidden - ProjectEditor import
// import ProjectEditor from "./pages/ProjectEditor";
import Endpoints from "./pages/Endpoints";
import TestCases from "./pages/TestCases";
import TestSuites from "./pages/TestSuites";
import Bugs from "./pages/Bugs";
import TestExecutions from "./pages/TestExecutions";
import AIAssistant from "./pages/AIAssistant";
import OpenAISettings from "./pages/settings/OpenAI";
import AppearanceSettings from "./pages/settings/Appearance";
import DangerZoneSettings from "./pages/settings/DangerZone";
import Documentation from "./pages/settings/Documentation";
import TestsReport from "./pages/settings/TestsReport";
import NotFound from "./pages/NotFound";
import BackendLoaderOverlay from "./components/BackendLoaderOverlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
      <ExecutionProvider>
        <TooltipProvider>
        <BackendLoaderOverlay />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/projects"
              element={
                <Layout>
                  <Projects />
                </Layout>
              }
            />
            {/* Temporarily hidden - ProjectEditor route
            <Route path="/projects/:id" element={<ProjectEditor />} />
            */}
            <Route
              path="/endpoints"
              element={
                <Layout>
                  <Endpoints />
                </Layout>
              }
            />
            <Route
              path="/test-cases"
              element={
                <Layout>
                  <TestCases />
                </Layout>
              }
            />
            <Route
              path="/test-suites"
              element={
                <Layout>
                  <TestSuites />
                </Layout>
              }
            />
            <Route
              path="/bugs"
              element={
                <Layout>
                  <Bugs />
                </Layout>
              }
            />
            <Route
              path="/test-executions"
              element={
                <Layout>
                  <TestExecutions />
                </Layout>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <Layout>
                  <AIAssistant />
                </Layout>
              }
            />

            {/* Settings Routes - /settings redirects to OpenAI (full sidebar with Documentation, etc.) */}
            <Route path="/settings" element={<Navigate to="/settings/documentation" replace />} />
            <Route
              path="/settings/openai"
              element={
                <SettingsLayout>
                  <OpenAISettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/appearance"
              element={
                <SettingsLayout>
                  <AppearanceSettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/danger"
              element={
                <SettingsLayout>
                  <DangerZoneSettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/documentation"
              element={
                <SettingsLayout>
                  <Documentation />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/tests"
              element={
                <SettingsLayout>
                  <TestsReport />
                </SettingsLayout>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
              </TooltipProvider>
      </ExecutionProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
