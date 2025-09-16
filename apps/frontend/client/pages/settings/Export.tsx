import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Calendar } from "lucide-react";

export default function ExportSettings() {
  const [exportFormat, setExportFormat] = useState("json");
  const [dateRange, setDateRange] = useState("all");
  const [includeData, setIncludeData] = useState({
    projects: true,
    testCases: true,
    executions: true,
    reports: true,
    settings: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Data Export</h2>
        <p className="text-muted-foreground">
          Export your Omega Testing data in various formats for backup or
          migration.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Include Data</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-projects"
                    checked={includeData.projects}
                    onCheckedChange={(checked) =>
                      setIncludeData({ ...includeData, projects: !!checked })
                    }
                  />
                  <Label htmlFor="export-projects">Projects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-tests"
                    checked={includeData.testCases}
                    onCheckedChange={(checked) =>
                      setIncludeData({ ...includeData, testCases: !!checked })
                    }
                  />
                  <Label htmlFor="export-tests">Test Cases</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-executions"
                    checked={includeData.executions}
                    onCheckedChange={(checked) =>
                      setIncludeData({ ...includeData, executions: !!checked })
                    }
                  />
                  <Label htmlFor="export-executions">Execution Results</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-reports"
                    checked={includeData.reports}
                    onCheckedChange={(checked) =>
                      setIncludeData({ ...includeData, reports: !!checked })
                    }
                  />
                  <Label htmlFor="export-reports">Reports & Analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-settings"
                    checked={includeData.settings}
                    onCheckedChange={(checked) =>
                      setIncludeData({ ...includeData, settings: !!checked })
                    }
                  />
                  <Label htmlFor="export-settings">Account Settings</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={
                isExporting ||
                !Object.values(includeData).some((selected) => selected)
              }
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
