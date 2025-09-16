import { Button } from "@/components/ui/button";
import { Plus, TestTube } from "lucide-react";

interface EndpointEmptyStateProps {
  onRegisterClick: () => void;
}

export default function EndpointEmptyState({ onRegisterClick }: EndpointEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">
        No endpoints found matching your criteria.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onRegisterClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Register Your First Endpoint
      </Button>
    </div>
  );
} 