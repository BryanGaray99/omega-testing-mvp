import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectEmptyStateProps {
  onRegisterClick: () => void;
}

export default function ProjectEmptyState({ onRegisterClick }: ProjectEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        No projects found matching your criteria.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onRegisterClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Project
      </Button>
    </div>
  );
} 