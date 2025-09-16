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
            placeholder="Search bugs..."
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
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
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
              <SelectValue placeholder={loadingSections ? "Loading..." : "All Sections"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
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
              <SelectValue placeholder={loadingEntities ? "Loading..." : "All Entities"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
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
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={BugType.SYSTEM_BUG}>System Bug</SelectItem>
              <SelectItem value={BugType.FRAMEWORK_ERROR}>Framework Error</SelectItem>
              <SelectItem value={BugType.TEST_FAILURE}>Test Failure</SelectItem>
              <SelectItem value={BugType.ENVIRONMENT_ISSUE}>Environment Issue</SelectItem>
            </SelectContent>
          </Select>

          {/* Severity Filter */}
          <Select 
            value={filters.severity || 'all'} 
            onValueChange={(value) => handleFilterChange('severity', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value={BugSeverity.LOW}>Low</SelectItem>
              <SelectItem value={BugSeverity.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BugSeverity.HIGH}>High</SelectItem>
              <SelectItem value={BugSeverity.CRITICAL}>Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value={BugPriority.LOW}>Low</SelectItem>
              <SelectItem value={BugPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BugPriority.HIGH}>High</SelectItem>
              <SelectItem value={BugPriority.CRITICAL}>Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={BugStatus.OPEN} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Open</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.IN_PROGRESS} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span>In Progress</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.RESOLVED} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Resolved</span>
                </span>
              </SelectItem>
              <SelectItem value={BugStatus.CLOSED} className="flex items-center gap-1">
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-gray-500" />
                  <span>Closed</span>
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
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reportedAt">Reported Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select 
            value={filters.sortOrder || 'DESC'} 
            onValueChange={(value) => handleFilterChange('sortOrder', value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Descending</SelectItem>
              <SelectItem value="ASC">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
