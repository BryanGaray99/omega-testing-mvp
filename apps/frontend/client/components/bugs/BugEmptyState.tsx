import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Bug, Plus } from "lucide-react";

interface BugEmptyStateProps {
  onCreateClick: () => void;
}

export function BugEmptyState({ onCreateClick }: BugEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Bug className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("bugs.emptyStateTitle")}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {t("bugs.emptyStateDesc")}
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        {t("bugs.createBug")}
      </Button>
    </div>
  );
}
