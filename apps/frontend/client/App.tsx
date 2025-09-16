import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import Reports from "./pages/Reports";
import Logs from "./pages/Logs";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/settings/Profile";
import SecuritySettings from "./pages/settings/Security";
import GitHubSettings from "./pages/settings/GitHub";
import OpenAISettings from "./pages/settings/OpenAI";
import TokensSettings from "./pages/settings/Tokens";
import NotificationsSettings from "./pages/settings/Notifications";
import AppearanceSettings from "./pages/settings/Appearance";
import ExportSettings from "./pages/settings/Export";
import DangerZoneSettings from "./pages/settings/DangerZone";
import NotFound from "./pages/NotFound";
import BackendLoaderOverlay from "./components/BackendLoaderOverlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
            <Route
              path="/logs"
              element={
                <Layout>
                  <Logs />
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

            {/* Settings Routes */}
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/settings/profile"
              element={
                <SettingsLayout>
                  <ProfileSettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/security"
              element={
                <SettingsLayout>
                  <SecuritySettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/github"
              element={
                <SettingsLayout>
                  <GitHubSettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/openai"
              element={
                <SettingsLayout>
                  <OpenAISettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/tokens"
              element={
                <SettingsLayout>
                  <TokensSettings />
                </SettingsLayout>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <SettingsLayout>
                  <NotificationsSettings />
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
              path="/settings/export"
              element={
                <SettingsLayout>
                  <ExportSettings />
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
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
