import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface CreateProjectData {
  name: string;
  displayName: string;
  baseUrl: string;
  basePath: string;
  type: 'playwright-bdd' | 'api-only';
}

interface ProjectRegisterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: CreateProjectData;
  setNewProject: (project: CreateProjectData) => void;
  onCreateProject: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function ProjectRegisterDialog({
  isOpen,
  onOpenChange,
  newProject,
  setNewProject,
  onCreateProject,
  onCancel,
  isPending,
}: ProjectRegisterDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("projects.newProject")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t("projects.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("projects.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">{t("projects.fieldProjectName")}</Label>
            <Input
              id="project-name"
              name="project-name"
              placeholder={t("projects.placeholderName")}
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">{t("projects.fieldDisplayName")}</Label>
            <Input
              id="display-name"
              name="display-name"
              placeholder={t("projects.placeholderDisplayName")}
              value={newProject.displayName}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  displayName: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="base-url">{t("projects.fieldBaseUrl")}</Label>
            <Input
              id="base-url"
              name="base-url"
              placeholder={t("projects.placeholderBaseUrl")}
              value={newProject.baseUrl}
              onChange={(e) =>
                setNewProject({ ...newProject, baseUrl: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="basePath">{t("projects.fieldBasePathOptional")}</Label>
            <Input
              id="basePath"
              name="basePath"
              placeholder={t("projects.placeholderBasePath")}
              value={newProject.basePath}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  basePath: e.target.value,
                })
              }
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="project-type">{t("projects.fieldProjectType")}</Label>
            <Select
              value={newProject.type}
              onValueChange={(value) =>
                setNewProject({
                  ...newProject,
                  type: value as 'playwright-bdd' | 'api-only',
                })
              }
            >
              <SelectTrigger id="project-type">
                <SelectValue placeholder={t("projects.placeholderProjectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playwright-bdd">{t("projects.typePlaywrightBdd")}</SelectItem>
                <SelectItem value="api-only">{t("projects.typeApiOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onCreateProject} disabled={isPending}>
            {isPending ? t("projects.creating") : t("projects.createProject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 