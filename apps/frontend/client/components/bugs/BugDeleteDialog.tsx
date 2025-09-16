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
import { Bug } from "@/components/types/bug.types";
import { AlertTriangle } from "lucide-react";

interface BugDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deletingBug: Bug | null;
  deleteConfirmation: string;
  setDeleteConfirmation: (value: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function BugDeleteDialog({
  isOpen,
  onOpenChange,
  deletingBug,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  onCancel,
  isPending,
}: BugDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Bug
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the bug
            <strong> "{deletingBug?.title}"</strong> and all its associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{deletingBug?.title}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Bug ID: {deletingBug?.bugId}</div>
              <div>Type: {deletingBug?.type}</div>
              <div>Severity: {deletingBug?.severity}</div>
              <div>Status: {deletingBug?.status}</div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delete-confirmation">
              Type <strong>"{deletingBug?.bugId}"</strong> to confirm
            </Label>
            <Input
              id="delete-confirmation"
              name="delete-confirmation"
              placeholder={deletingBug?.bugId}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="border-destructive focus:border-destructive"
            />
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-xs text-destructive">
              This will delete the bug from the database and remove all associated test case and execution history.
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
            disabled={isPending || deleteConfirmation !== deletingBug?.bugId}
          >
            {isPending ? "Deleting..." : "Delete Bug"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
