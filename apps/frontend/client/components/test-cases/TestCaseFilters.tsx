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

interface TestCaseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  methodFilter: string;
  setMethodFilter: (value: string) => void;
  statusFilter: string; // execution status: all | pending | passed | failed
  setStatusFilter: (value: string) => void;
  projects: ProjectOption[];
  methods: string[];
  sections: string[];
  entities: string[];
  sortBy: 'updatedAt' | 'createdAt' | 'lastRun' | 'name';
  setSortBy: (v: 'updatedAt' | 'createdAt' | 'lastRun' | 'name') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (v: 'asc' | 'desc') => void;
}

export default function TestCaseFilters({
  searchTerm,
  setSearchTerm,
  projectFilter,
  setProjectFilter,
  sectionFilter,
  setSectionFilter,
  entityFilter,
  setEntityFilter,
  methodFilter,
  setMethodFilter,
  statusFilter,
  setStatusFilter,
  projects,
  methods,
  sections,
  entities,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: TestCaseFiltersProps) {
  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
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
          <Select value={projectFilter} onValueChange={(v) => { setProjectFilter(v); setSectionFilter('all'); setEntityFilter('all'); }}>
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

          {/* Section */}
          <Select value={sectionFilter} onValueChange={(v) => { setSectionFilter(v); setEntityFilter('all'); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity */}
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Method */}
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Execution Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort by */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Created At" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Update At</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="lastRun">Last Run</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
} 