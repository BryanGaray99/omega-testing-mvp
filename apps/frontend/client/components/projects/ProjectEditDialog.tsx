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

interface UpdateProjectData {
  displayName: string;
  baseUrl: string;
  basePath: string;
}

interface ProjectEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
  editProjectData: UpdateProjectData;
  setEditProjectData: (data: UpdateProjectData) => void;
  onUpdateProject: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ProjectEditDialog({
  isOpen,
  onOpenChange,
  editingProject,
  editProjectData,
  setEditProjectData,
  onUpdateProject,
  onCancel,
  isPending,
}: ProjectEditDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t("projects.editTitle")}</DialogTitle>
          <DialogDescription>
            {t("projects.editDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-display-name">{t("projects.fieldDisplayName")}</Label>
            <Input
              id="edit-display-name"
              name="edit-display-name"
              placeholder={t("projects.placeholderDisplayName")}
              value={editProjectData.displayName}
              onChange={(e) =>
                setEditProjectData({
                  ...editProjectData,
                  displayName: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-base-url">{t("projects.fieldBaseUrl")}</Label>
            <Input
              id="edit-base-url"
              name="edit-base-url"
              placeholder={t("projects.placeholderBaseUrl")}
              value={editProjectData.baseUrl}
              onChange={(e) =>
                setEditProjectData({ ...editProjectData, baseUrl: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-basePath">{t("projects.fieldBasePathOptional")}</Label>
            <Input
              id="edit-basePath"
              name="edit-basePath"
              placeholder={t("projects.placeholderBasePath")}
              value={editProjectData.basePath}
              onChange={(e) =>
                setEditProjectData({
                  ...editProjectData,
                  basePath: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onUpdateProject} disabled={isPending}>
            {isPending ? t("projects.updating") : t("projects.updateProject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 