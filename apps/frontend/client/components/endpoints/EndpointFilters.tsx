import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface EndpointFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  projectFilter: string;
  setProjectFilter: (filter: string) => void;
  methodFilter: string;
  setMethodFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  projects: any[];
}

export default function EndpointFilters({
  searchTerm,
  setSearchTerm,
  projectFilter,
  setProjectFilter,
  methodFilter,
  setMethodFilter,
  statusFilter,
  setStatusFilter,
  projects,
}: EndpointFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("endpoints.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("endpoints.allProjects")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("endpoints.allProjects")}</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.displayName || project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("endpoints.method")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("endpoints.allMethods")}</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("endpoints.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("endpoints.allStatus")}</SelectItem>
            <SelectItem value="ready">{t("endpoints.statusReady")}</SelectItem>
            <SelectItem value="analyzing">{t("endpoints.statusAnalyzing")}</SelectItem>
            <SelectItem value="generating">{t("endpoints.statusGenerating")}</SelectItem>
            <SelectItem value="pending">{t("endpoints.statusPending")}</SelectItem>
            <SelectItem value="failed">{t("endpoints.statusFailed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 