import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface ProjectEmptyStateProps {
  onRegisterClick: () => void;
}

export default function ProjectEmptyState({ onRegisterClick }: ProjectEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        {t("projects.emptyMessage")}
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onRegisterClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("projects.createFirst")}
      </Button>
    </div>
  );
} 