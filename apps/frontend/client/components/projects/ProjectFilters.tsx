import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface ProjectFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export default function ProjectFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: ProjectFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-projects"
          name="search-projects"
          placeholder={t("projects.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger id="status-filter" className="w-[180px]" aria-label={t("projects.filterByStatus")}>
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t("projects.filterByStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("projects.allStatus")}</SelectItem>
          <SelectItem value="ready">{t("projects.statusReady")}</SelectItem>
          <SelectItem value="pending">{t("projects.statusPending")}</SelectItem>
          <SelectItem value="failed">{t("projects.statusFailed")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 