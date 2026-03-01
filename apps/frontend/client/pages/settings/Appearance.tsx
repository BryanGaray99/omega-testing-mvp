import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Sun, Moon, Languages } from "lucide-react";
import { useLanguage, useTranslation, type Language } from "@/contexts/LanguageContext";

export default function AppearanceSettings() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (prefersDark) {
      setTheme("dark");
    }
  }, []);

  const handleThemeChange = (value: "light" | "dark") => {
    setTheme(value);
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("appearance.title")}</h2>
        <p className="text-muted-foreground">
          {t("appearance.description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>{t("theme.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("theme.title")}</Label>
              <Select value={theme} onValueChange={(v) => handleThemeChange(v as "light" | "dark")}>
                <SelectTrigger className="w-[200px]" aria-label={t("theme.title")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> {t("theme.light")}
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> {t("theme.dark")}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Languages className="h-5 w-5" />
              <span>{t("appearance.languageCard")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("lang.label")}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="w-[200px]" aria-label={t("lang.label")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("lang.english")}</SelectItem>
                  <SelectItem value="es">{t("lang.spanish")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
