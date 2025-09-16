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
  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test suites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {/* Project */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {getProjectName(project)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="test_set">Test Set</SelectItem>
              <SelectItem value="test_plan">Test Plan</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort by */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Updated At</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="lastExecutedAt">Last Executed</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Desc</SelectItem>
              <SelectItem value="ASC">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
