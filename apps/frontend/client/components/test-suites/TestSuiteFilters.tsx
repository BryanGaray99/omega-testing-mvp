import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

interface ProjectOption {
  id: string;
  name?: string;
  displayName?: string;
}

interface TestSuiteFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  projects: ProjectOption[];
  sortBy: 'updatedAt' | 'createdAt' | 'lastExecutedAt' | 'name';
  setSortBy: (v: 'updatedAt' | 'createdAt' | 'lastExecutedAt' | 'name') => void;
  sortOrder: 'ASC' | 'DESC';
  setSortOrder: (v: 'ASC' | 'DESC') => void;
}

export default function TestSuiteFilters({
  searchTerm,
  setSearchTerm,
  projectFilter,
  setProjectFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  sectionFilter,
  setSectionFilter,
  entityFilter,
  setEntityFilter,
  projects,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: TestSuiteFiltersProps) {
  const { t } = useTranslation();
  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("testSuites.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowAdvanced(v => !v)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showAdvanced ? t("testSuites.hideFilters") : t("testSuites.showFilters")}
        </Button>
      </div>

      {showAdvanced && (
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("testSuites.allProjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("testSuites.allProjects")}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {getProjectName(project)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("testSuites.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("testSuites.allTypes")}</SelectItem>
              <SelectItem value="test_set">{t("testSuites.typeTestSet")}</SelectItem>
              <SelectItem value="test_plan">{t("testSuites.typeTestPlan")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("testSuites.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("testSuites.allStatus")}</SelectItem>
              <SelectItem value="pending">{t("testSuites.statusPending")}</SelectItem>
              <SelectItem value="running">{t("testSuites.statusRunning")}</SelectItem>
              <SelectItem value="passed">{t("testSuites.statusPassed")}</SelectItem>
              <SelectItem value="failed">{t("testSuites.statusFailed")}</SelectItem>
              <SelectItem value="skipped">{t("testSuites.statusSkipped")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("testSuites.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">{t("testSuites.sortUpdatedAt")}</SelectItem>
              <SelectItem value="createdAt">{t("testSuites.sortCreatedAt")}</SelectItem>
              <SelectItem value="lastExecutedAt">{t("testSuites.sortLastExecuted")}</SelectItem>
              <SelectItem value="name">{t("testSuites.sortName")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("testSuites.sortOrder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">{t("testSuites.orderDesc")}</SelectItem>
              <SelectItem value="ASC">{t("testSuites.orderAsc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
