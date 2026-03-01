import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const FLAG_EN = "🇺🇸";
const FLAG_ES = "🇪🇸";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div
      className="flex rounded-lg border border-input bg-muted/40 p-0.5 shadow-sm"
      role="group"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        title={t("lang.english")}
        className={cn(
          "flex h-8 min-w-[2.5rem] items-center justify-center rounded-md px-2.5 text-lg transition-all",
          language === "en"
            ? "bg-sky-500 text-white shadow-sm dark:bg-sky-600"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="leading-none" aria-hidden>
          {FLAG_EN}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("es")}
        title={t("lang.spanish")}
        className={cn(
          "flex h-8 min-w-[2.5rem] items-center justify-center rounded-md px-2.5 text-lg transition-all",
          language === "es"
            ? "bg-amber-500 text-white shadow-sm dark:bg-amber-600"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="leading-none" aria-hidden>
          {FLAG_ES}
        </span>
      </button>
    </div>
  );
}
