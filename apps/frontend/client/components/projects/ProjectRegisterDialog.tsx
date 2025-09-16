import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new testing project with its basic configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              name="project-name"
              placeholder="e.g., ecommerce-api"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              name="display-name"
              placeholder="e.g., E-commerce Platform API"
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
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              name="base-url"
              placeholder="https://api.example.com"
              value={newProject.baseUrl}
              onChange={(e) =>
                setNewProject({ ...newProject, baseUrl: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="basePath">Base Path (Optional)</Label>
            <Input
              id="basePath"
              name="basePath"
              placeholder="/v1/api"
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
            <Label htmlFor="project-type">Project Type</Label>
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
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playwright-bdd">Playwright BDD</SelectItem>
                <SelectItem value="api-only">API Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onCreateProject} disabled={isPending}>
            {isPending ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 