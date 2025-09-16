import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SyncProjectDialog from "./SyncProjectDialog";
import {
  BarChart3,
  Settings,
  TestTube,
  PlayCircle,
  FolderKanban,
  Menu,
  X,
  Sun,
  Moon,
  Bot,
  Home,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Layers,
  Bug,
  ClipboardList,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hidden?: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Endpoints", href: "/endpoints", icon: BarChart3 },
  { name: "Test Cases", href: "/test-cases", icon: TestTube },
  { name: "Test Suites", href: "/test-suites", icon: Layers },
  { name: "Bugs", href: "/bugs", icon: Bug },
  { name: "Test Executions", href: "/test-executions", icon: PlayCircle },
  { name: "Reports", href: "/reports", icon: ClipboardList, hidden: true },
  { name: "Logs", href: "/logs", icon: FileText, hidden: true },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot, hidden: true },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSyncProjectDialog, setShowSyncProjectDialog] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldUseDark);
    setSidebarCollapsed(savedSidebarState === "true");

    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
  };

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";
  const sidebarPadding = sidebarCollapsed ? "lg:pl-16" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
            <div className="flex h-16 items-center justify-between px-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Omega Testing</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 px-4">
              {navigation.filter(item => !item.hidden).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block transition-all duration-300",
          sidebarWidth,
        )}
      >
        <div className="flex h-full flex-col bg-card border-r border-border">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Omega Testing</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link to="/" className="mx-auto">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-primary-foreground" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={cn("mt-8 flex-1", sidebarCollapsed ? "px-2" : "px-4")}
          >
            {navigation.filter(item => !item.hidden).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors mb-1",
                    sidebarCollapsed
                      ? "justify-center p-3"
                      : "space-x-3 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Toggle button at bottom */}
          <div
            className={cn(
              "border-t border-border p-4",
              sidebarCollapsed && "px-2",
            )}
          >
            <Button
              variant="ghost"
              size={sidebarCollapsed ? "icon" : "sm"}
              onClick={toggleSidebar}
              className={cn(
                "w-full",
                sidebarCollapsed ? "justify-center" : "justify-start",
              )}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarPadding)}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-foreground">
                Omega Testing
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-8 w-8"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8"
              >
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowSyncProjectDialog(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync Project
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>

      <SyncProjectDialog open={showSyncProjectDialog} onOpenChange={setShowSyncProjectDialog} />
    </div>
  );
}
