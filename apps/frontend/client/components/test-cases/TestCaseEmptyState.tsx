import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface TestCaseEmptyStateProps {
  onCreateClick: () => void;
}

export default function TestCaseEmptyState({
  onCreateClick,
}: TestCaseEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">
        {t("testCases.emptyMessage")}
      </p>
      <Button variant="outline" className="mt-4" onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        {t("testCases.createFirst")}
      </Button>
    </div>
  );
} 