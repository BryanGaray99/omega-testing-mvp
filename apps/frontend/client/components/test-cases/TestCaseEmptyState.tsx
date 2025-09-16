import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface TestCaseEmptyStateProps {
  onCreateClick: () => void;
}

export default function TestCaseEmptyState({
  onCreateClick,
}: TestCaseEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">
        No test cases found matching your criteria.
      </p>
      <Button variant="outline" className="mt-4" onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Test Case
      </Button>
    </div>
  );
} 