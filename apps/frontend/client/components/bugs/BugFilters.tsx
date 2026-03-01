import { useTranslation } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { BugFilters as BugFiltersType, BugType, BugSeverity, BugPriority, BugStatus, FailedExecution } from "@/components/types/bug.types";
import { getProjectSectionsAndEntities, getProjectEntities } from "@/services/testCaseService";

interface ProjectOption {
  id: string;
  name?: string;
  displayName?: string;
}

interface BugFiltersProps {
  filters: BugFiltersType;
  onFiltersChange: (filters: BugFiltersType) => void;
  projects: ProjectOption[];
  failedExecutions: FailedExecution[];
  loadingFailedExecutions: boolean;
}

export function BugFilters({
  filters,
  onFiltersChange,
  projects,
  failedExecutions,
  loadingFailedExecutions,
}: BugFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Load sections when project changes
  useEffect(() => {
    const loadSections = async () => {
      if (!filters.projectId) {
        setSections([]);
        setEntities([]);
        return;
      }

      setLoadingSections(true);
      try {
        const { sections: projectSections } = await getProjectSectionsAndEntities(filters.projectId);
        setSections(projectSections);
        setEntities([]); // Reset entities when project changes
      } catch (error) {
        console.error('Error loading sections:', error);
        setSections([]);
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, [filters.projectId]);

  // Load entities when section changes
  useEffect(() => {
    const loadEntities = async () => {
      if (!filters.projectId || !filters.section) {
        setEntities([]);
        return;
      }

      setLoadingEntities(true);
      try {
        const projectEntities = await getProjectEntities(filters.projectId, filters.section);
        setEntities(projectEntities);
      } catch (error) {
        console.error('Error loading entities:', error);
        setEntities([]);
      } finally {
        setLoadingEntities(false);
      }
    };

    loadEntities();
  }, [filters.projectId, filters.section]);

  const handleFilterChange = (key: keyof BugFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters
    if (key === 'projectId') {
      newFilters.section = undefined;
      newFilters.entity = undefined;
    } else if (key === 'section') {
      newFilters.entity = undefined;
    }
    
    // Reset page when changing filters
    if (key !== 'page' && key !== 'limit') {
      newFilters.page = 1;
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: BugFiltersType = {
      sortBy: 'reportedAt',
      sortOrder: 'DESC',
      page: 1,
      limit: 10,
    };
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("bugs.searchPlaceholder")}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowAdvanced(v => !v)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showAdvanced && (
        <div className="flex gap-2 flex-wrap items-center">
          {/* Project Filter */}
          <Select 
            value={filters.projectId || 'all'} 
            onValueChange={(value) => handleFilterChange('projectId', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("bugs.allProjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allProjects")}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.displayName || project.name || project.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section Filter */}
          <Select 
            value={filters.section || 'all'} 
            onValueChange={(value) => handleFilterChange('section', value === 'all' ? undefined : value)}
            disabled={!filters.projectId || loadingSections}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={loadingSections ? t("bugs.loadingLabel") : t("bugs.allSections")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allSections")}</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity Filter */}
          <Select 
            value={filters.entity || 'all'} 
            onValueChange={(value) => handleFilterChange('entity', value === 'all' ? undefined : value)}
            disabled={!filters.section || loadingEntities}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={loadingEntities ? t("bugs.loadingLabel") : t("bugs.allEntities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allEntities")}</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select 
            value={filters.type || 'all'} 
            onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("bugs.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allTypes")}</SelectItem>
              <SelectItem value={BugType.SYSTEM_BUG}>{t("bugs.typeSystemBug")}</SelectItem>
              <SelectItem value={BugType.FRAMEWORK_ERROR}>{t("bugs.typeFrameworkError")}</SelectItem>
              <SelectItem value={BugType.TEST_FAILURE}>{t("bugs.typeTestFailure")}</SelectItem>
              <SelectItem value={BugType.ENVIRONMENT_ISSUE}>{t("bugs.typeEnvironmentIssue")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Severity Filter */}
          <Select 
            value={filters.severity || 'all'} 
            onValueChange={(value) => handleFilterChange('severity', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("bugs.allSeverities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allSeverities")}</SelectItem>
              <SelectItem value={BugSeverity.LOW}>{t("bugs.severityLow")}</SelectItem>
              <SelectItem value={BugSeverity.MEDIUM}>{t("bugs.severityMedium")}</SelectItem>
              <SelectItem value={BugSeverity.HIGH}>{t("bugs.severityHigh")}</SelectItem>
              <SelectItem value={BugSeverity.CRITICAL}>{t("bugs.severityCritical")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("bugs.allPriorities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allPriorities")}</SelectItem>
              <SelectItem value={BugPriority.LOW}>{t("bugs.severityLow")}</SelectItem>
              <SelectItem value={BugPriority.MEDIUM}>{t("bugs.severityMedium")}</SelectItem>
              <SelectItem value={BugPriority.HIGH}>{t("bugs.severityHigh")}</SelectItem>
              <SelectItem value={BugPriority.CRITICAL}>{t("bugs.severityCritical")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("bugs.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bugs.allStatuses")}</SelectItem>
              <SelectItem value={BugStatus.OPEN} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>{t("bugs.statusOpen")}</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.IN_PROGRESS} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span>{t("bugs.statusInProgress")}</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.RESOLVED} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{t("bugs.statusResolved")}</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.CLOSED} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-gray-500" />
                  <span>{t("bugs.statusClosed")}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>



          {/* Sort By */}
          <Select 
            value={filters.sortBy || 'reportedAt'} 
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("bugs.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reportedAt">{t("bugs.sortReportedAt")}</SelectItem>
              <SelectItem value="title">{t("bugs.sortTitle")}</SelectItem>
              <SelectItem value="severity">{t("bugs.sortSeverity")}</SelectItem>
              <SelectItem value="priority">{t("bugs.sortPriority")}</SelectItem>
              <SelectItem value="status">{t("bugs.sortStatus")}</SelectItem>
              <SelectItem value="createdAt">{t("bugs.sortCreatedAt")}</SelectItem>
              <SelectItem value="updatedAt">{t("bugs.sortUpdatedAt")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select 
            value={filters.sortOrder || 'DESC'} 
            onValueChange={(value) => handleFilterChange('sortOrder', value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("bugs.order")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">{t("bugs.descending")}</SelectItem>
              <SelectItem value="ASC">{t("bugs.ascending")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
