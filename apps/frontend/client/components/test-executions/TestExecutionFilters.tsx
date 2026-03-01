import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { TestExecutionFilters as TestExecutionFiltersType, TestExecutionStatus } from '@/components/types/test-execution.types';

interface ProjectOption {
  id: string;
  name?: string;
  displayName?: string;
}

interface TestExecutionFiltersProps {
  filters: TestExecutionFiltersType;
  onFiltersChange: (filters: TestExecutionFiltersType) => void;
  entities: string[];
  testTypes: string[];
  sections: string[];
  projects: ProjectOption[];
}

export function TestExecutionFilters({
  filters,
  onFiltersChange,
  entities,
  testTypes,
  sections,
  projects,
}: TestExecutionFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;

  const handleInputChange = (field: keyof TestExecutionFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: undefined,
      entityName: undefined,
      testType: undefined,
      projectId: undefined,
      section: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status ||
    filters.entityName ||
    filters.testType ||
    filters.projectId ||
    filters.section ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sortBy ||
    filters.sortOrder;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("exec.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowAdvanced(v => !v)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showAdvanced ? t("exec.hideFilters") : t("exec.showFilters")}
        </Button>
      </div>

      {showAdvanced && (
        <div className="flex gap-2 flex-wrap items-center">
          {/* Project */}
          <Select 
            value={filters.projectId || 'all'} 
            onValueChange={(v) => handleInputChange('projectId', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("exec.allProjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exec.allProjects")}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {getProjectName(project)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section */}
          <Select 
            value={filters.section || 'all'} 
            onValueChange={(v) => handleInputChange('section', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("exec.allSections")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exec.allSections")}</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity */}
          <Select 
            value={filters.entityName || 'all'} 
            onValueChange={(v) => handleInputChange('entityName', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("exec.allEntities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exec.allEntities")}</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>



          {/* Status */}
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(v) => handleInputChange('status', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("exec.statusPlaceholder")} />
            </SelectTrigger>
                         <SelectContent>
               <SelectItem value="all">{t("exec.allStatus")}</SelectItem>
               <SelectItem value="running">{t("exec.statusRunning")}</SelectItem>
               <SelectItem value="completed">{t("exec.statusCompleted")}</SelectItem>
               <SelectItem value="failed">{t("exec.statusFailed")}</SelectItem>
             </SelectContent>
          </Select>

          {/* Sort by */}
          <Select 
            value={filters.sortBy || 'startedAt'} 
            onValueChange={(v) => handleInputChange('sortBy', v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("exec.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startedAt">{t("exec.startedAt")}</SelectItem>
              <SelectItem value="completedAt">{t("exec.completedAt")}</SelectItem>
              <SelectItem value="executionTime">{t("exec.executionTime")}</SelectItem>
              <SelectItem value="totalScenarios">{t("exec.totalScenarios")}</SelectItem>
              <SelectItem value="passedScenarios">{t("exec.passedScenarios")}</SelectItem>
              <SelectItem value="failedScenarios">{t("exec.failedScenarios")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Select 
            value={filters.sortOrder || 'desc'} 
            onValueChange={(v) => handleInputChange('sortOrder', v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("exec.order")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t("exec.desc")}</SelectItem>
              <SelectItem value="asc">{t("exec.asc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
