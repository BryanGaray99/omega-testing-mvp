import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  Palette,
  Trash2,
  Settings,
  TestTube,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNavKeys: { nameKey: TranslationKey; href: string; icon: typeof BookOpen }[] = [
  { nameKey: "settings.docs", href: "/settings/documentation", icon: BookOpen },
  { nameKey: "settings.tests", href: "/settings/tests", icon: ClipboardCheck },
  { nameKey: "settings.openai", href: "/settings/openai", icon: Bot },
  { nameKey: "settings.appearance", href: "/settings/appearance", icon: Palette },
  { nameKey: "settings.dangerZone", href: "/settings/danger", icon: Trash2 },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { t } = useTranslation();
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
          <div className="flex h-16 items-center px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-success flex items-center justify-center">
                <Settings className="h-4 w-4 text-success-foreground" />
              </div>
              <span className="font-bold text-foreground">{t("nav.settings")}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4">
            {settingsNavKeys.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TestTube className="h-4 w-4" />
              <span>{t("settings.footer")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
            <h1 className="flex-1 text-lg font-semibold text-foreground">
              {t("settings.title")}
            </h1>
            <Button asChild variant="outline" size="sm" className="shrink-0 self-center">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("nav.back")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
