import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Shield,
  Github,
  Bot,
  Key,
  Bell,
  Palette,
  Download,
  Trash2,
  Settings,
  TestTube,
} from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Account Security", href: "/settings/security", icon: Shield },
  { name: "GitHub Integration", href: "/settings/github", icon: Github },
  { name: "OpenAI Configuration", href: "/settings/openai", icon: Bot },
  { name: "API Keys & Tokens", href: "/settings/tokens", icon: Key },
  { name: "Notifications", href: "/settings/notifications", icon: Bell },
  { name: "Appearance", href: "/settings/appearance", icon: Palette },
  { name: "Data Export", href: "/settings/export", icon: Download },
  { name: "Danger Zone", href: "/settings/danger", icon: Trash2 },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Settings Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Settings</span>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4">
            {settingsNavigation.map((item) => {
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
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TestTube className="h-4 w-4" />
              <span>Omega Testing Settings v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-foreground">
                Account & Platform Settings
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
