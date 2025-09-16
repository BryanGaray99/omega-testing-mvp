import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestExecution } from "@/components/types/test-execution.types";

interface TestExecutionDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deletingExecution: TestExecution | null;
  deleteConfirmation: string;
  setDeleteConfirmation: (value: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function TestExecutionDeleteDialog({
  isOpen,
  onOpenChange,
  deletingExecution,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  onCancel,
  isPending,
}: TestExecutionDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Test Execution</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the test execution
            <strong> "{deletingExecution?.executionId}"</strong> and all its associated results.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-confirmation">
              Type <strong>"{deletingExecution?.executionId}"</strong> to confirm
            </Label>
            <Input
              id="delete-confirmation"
              name="delete-confirmation"
              placeholder={deletingExecution?.executionId}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="border-destructive focus:border-destructive"
            />
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-xs text-destructive">
              This will delete the test execution from the database and remove all associated test results and metadata.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isPending || deleteConfirmation !== deletingExecution?.executionId}
          >
            {isPending ? "Deleting..." : "Delete Test Execution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
