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
import { useTranslation } from "@/contexts/LanguageContext";
import { replaceParams } from "@/lib/translations";

interface Project {
  id: string;
  name: string;
  displayName?: string;
  baseUrl: string;
  basePath?: string;
  type: "playwright-bdd" | "api-only";
  status: "pending" | "ready" | "failed";
  endpoints: number;
  testCases: number;
  lastRun: string;
  createdAt: string;
  path?: string;
}

interface ProjectDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deletingProject: Project | null;
  deleteConfirmation: string;
  setDeleteConfirmation: (value: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ProjectDeleteDialog({
  isOpen,
  onOpenChange,
  deletingProject,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  onCancel,
  isPending,
}: ProjectDeleteDialogProps) {
  const { t } = useTranslation();
  const name = deletingProject?.name ?? "";
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t("projects.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {replaceParams(t("projects.deleteDescription"), { name })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-confirmation">
              {replaceParams(t("projects.deleteTypeToConfirm"), { name })}
            </Label>
            <Input
              id="delete-confirmation"
              name="delete-confirmation"
              placeholder={name}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="border-destructive focus:border-destructive"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isPending || deleteConfirmation !== deletingProject?.name}
          >
            {isPending ? t("projects.deleting") : t("projects.deleteProject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 