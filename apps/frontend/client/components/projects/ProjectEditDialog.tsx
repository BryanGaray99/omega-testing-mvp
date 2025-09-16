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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project configuration. Note: Project name and type cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-display-name">Display Name</Label>
            <Input
              id="edit-display-name"
              name="edit-display-name"
              placeholder="e.g., E-commerce Platform API"
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
            <Label htmlFor="edit-base-url">Base URL</Label>
            <Input
              id="edit-base-url"
              name="edit-base-url"
              placeholder="https://api.example.com"
              value={editProjectData.baseUrl}
              onChange={(e) =>
                setEditProjectData({ ...editProjectData, baseUrl: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-basePath">Base Path (Optional)</Label>
            <Input
              id="edit-basePath"
              name="edit-basePath"
              placeholder="/v1/api"
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
            Cancel
          </Button>
          <Button onClick={onUpdateProject} disabled={isPending}>
            {isPending ? "Updating..." : "Update Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 