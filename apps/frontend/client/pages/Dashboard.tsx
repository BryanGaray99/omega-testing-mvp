import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeTimeToSeconds } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  RefreshCw,
  AlertTriangle,
  Bug,
  Activity,
  Layers,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { severityChartColors, priorityChartColors, typeChartColors } from "@/lib/colors";

const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

async function fetchGlobalExecutionSummary() {
  const res = await fetch(`${API_BASE}/test-execution/summary`);
  if (!res.ok) throw new Error("Error fetching global execution summary");
  return res.json();
}

async function fetchDashboardKpis() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`);
  if (!res.ok) throw new Error("Error fetching dashboard KPIs");
  return res.json();
}

const SEVERITY_ORDER = ["low", "medium", "high", "critical"] as const;
const PRIORITY_ORDER = ["low", "medium", "high", "critical"] as const;
const SEVERITY_KEYS = {
  low: "bugs.severityLow",
  medium: "bugs.severityMedium",
  high: "bugs.severityHigh",
  critical: "bugs.severityCritical",
} as const;

function BugsHeatmap({ data }: { data: Record<string, number> }) {
  const { t } = useTranslation();
  const { grid, total, monthLabels } = useMemo(() => {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    const currentYear = today.getFullYear();

    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Align to weeks starting on Sunday (GitHub style)
    const start = new Date(yearStart);
    const startDay = start.getDay(); // 0 = Sunday
    start.setDate(start.getDate() - startDay);

    const end = new Date(yearEnd);
    const endDay = end.getDay(); // 6 = Saturday
    end.setDate(end.getDate() + (6 - endDay));

    const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
    const weeks = Math.ceil(totalDays / 7);

    let sum = 0;
    const rows: { date: string; count: number }[][] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabels: string[] = [];
    let lastMonth = -1;

    for (let week = 0; week < weeks; week++) {
      const col: { date: string; count: number }[] = [];
      let firstDateInWeek: Date | null = null;
      for (let day = 0; day < 7; day++) {
        const d = new Date(start);
        d.setDate(start.getDate() + week * 7 + day);
        // Outside of selected calendar year: leave empty, do not count
        if (d < yearStart || d > yearEnd) {
          col.push({ date: "", count: 0 });
          continue;
        }
        const dateStr = d.toISOString().slice(0, 10);
        const count = data[dateStr] ?? 0;
        sum += count;
        col.push({ date: dateStr, count });
        if (!firstDateInWeek) firstDateInWeek = new Date(d);
      }
      rows.push(col);

      let label = "";
      if (firstDateInWeek) {
        const month = firstDateInWeek.getMonth();
        const dayOfMonth = firstDateInWeek.getDate();
        if (month !== lastMonth && dayOfMonth <= 7) {
          label = monthNames[month];
          lastMonth = month;
        }
      }
      monthLabels.push(label);
    }
    return { grid: rows, total: sum, monthLabels };
  }, [data]);

  const intensity = (count: number) => {
    if (count === 0) return "bg-background dark:bg-background";
    if (count <= 5) return "bg-red-300 dark:bg-red-300";
    if (count <= 10) return "bg-red-500 dark:bg-red-500";
    return "bg-red-700 dark:bg-red-700";
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {total} {t("nav.bugs").toLowerCase()} in the last year
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* Weekday labels (GitHub-style: show Mon, Wed, Fri aligned to rows) */}
        <div className="flex flex-col gap-0.5 pt-5 pr-1 text-[10px] text-muted-foreground">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, idx) => (
            <div key={`weekday-${idx}`} className="h-3 flex items-center">
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {/* Month labels */}
          <div className="flex gap-0.5 mb-1 text-[10px] text-muted-foreground">
            {monthLabels.map((label, idx) => (
              <div key={`month-${idx}`} className="w-3 text-center">
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5">
            {grid.map((col, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {col.map((cell, dayIndex) => (
                  <div
                    key={cell.date || `${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm border border-black/70 dark:border-white/80 ${intensity(
                      cell.count,
                    )}`}
                    title={cell.date ? `${cell.date}: ${cell.count} bugs` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          Less
          <span className="w-3 h-3 rounded-sm bg-background border border-black/70 dark:border-white/80 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-red-300 border border-black/70 dark:border-white/80 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-red-500 border border-black/70 dark:border-white/80 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-red-700 border border-black/70 dark:border-white/80 inline-block" />
          More
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: summaryData, refetch: refetchSummary } = useQuery({
    queryKey: ["global-execution-summary"],
    queryFn: fetchGlobalExecutionSummary,
  });
  const { data: kpisData, isLoading: loadingKpis, refetch: refetchKpis } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: fetchDashboardKpis,
  });

  useEffect(() => {
    const onReady = () => void handleRefresh();
    window.addEventListener("backend-ready", onReady as EventListener);
    return () => window.removeEventListener("backend-ready", onReady as EventListener);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSummary(), refetchKpis()]);
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  const summary = summaryData?.data;
  const kpis = kpisData?.data;
  const counts = kpis?.counts ?? { projects: 0, endpoints: 0, testCases: 0 };
  const loading = loadingKpis;

  const successRate = Number(summary?.successRate) ?? 0;
  const passedTests = Number(summary?.totalPassed) ?? 0;
  const failedTests = Number(summary?.totalFailed) ?? 0;
  const averageExecutionTime = Number(summary?.averageExecutionTime) ?? 0;

  const changeFailureRate = kpis?.execution?.changeFailureRate ?? null;
  const mttrHours = kpis?.mttrHours ?? null;
  const mttdHours = kpis?.mttdHours ?? null;
  const openBugs = (kpis?.bugs?.open ?? 0) + (kpis?.bugs?.inProgress ?? 0);
  const bySeverity = kpis?.bugs?.bySeverity ?? {};
  const byPriority = kpis?.bugs?.byPriority ?? {};
  const byType = kpis?.bugs?.byType ?? {};
  const bugsHeatmap = kpis?.bugsHeatmap ?? {};

  const severityPieData = SEVERITY_ORDER.map((key) => ({
    name: t(SEVERITY_KEYS[key]),
    value: bySeverity[key] ?? 0,
    fill: severityChartColors[SEVERITY_ORDER.indexOf(key)],
  })).filter((d) => d.value > 0);
  const priorityPieData = PRIORITY_ORDER.map((key) => ({
    name: t(SEVERITY_KEYS[key]),
    value: byPriority[key] ?? 0,
    fill: priorityChartColors[PRIORITY_ORDER.indexOf(key)],
  })).filter((d) => d.value > 0);

  const typePieData = [
    {
      key: "test_failure",
      name: t("bugs.typeTestFailure"),
      value: byType.test_failure ?? 0,
      fill: typeChartColors[0],
    },
    {
      key: "system_bug",
      name: t("bugs.typeSystemBug"),
      value: byType.system_bug ?? 0,
      fill: typeChartColors[1],
    },
    {
      key: "framework_error",
      name: t("bugs.typeFrameworkError"),
      value: byType.framework_error ?? 0,
      fill: typeChartColors[2],
    },
    {
      key: "environment_issue",
      name: t("bugs.typeEnvironmentIssue"),
      value: byType.environment_issue ?? 0,
      fill: typeChartColors[3],
    },
  ].filter((d) => d.value > 0);
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.welcome")}</h1>
          <p className="mt-2 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? t("dashboard.refreshing") : t("dashboard.refreshData")}
          </Button>
          <Button asChild>
            <Link to="/projects">
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.newProject")}
            </Link>
          </Button>
        </div>
      </div>

      {/* General metrics */}
      <section aria-labelledby="general-metrics-heading">
        <h2 id="general-metrics-heading" className="text-lg font-semibold text-foreground mb-4">
          {t("dashboard.generalMetrics")}
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ${
            isRefreshing ? "opacity-70" : "opacity-100"
          }`}
        >
          {/* Overview: Projects, Endpoints, Test Cases in one card */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {t("dashboard.overview")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.totalProjects")}</span>
                <span className="font-semibold text-foreground">{loading ? "—" : counts.projects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.totalEndpoints")}</span>
                <span className="font-semibold text-foreground">{loading ? "—" : counts.endpoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.testCases")}</span>
                <span className="font-semibold text-foreground">{loading ? "—" : counts.testCases}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">
                {t("dashboard.successRate")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.cfrHelp")}</p>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="text-2xl font-bold text-foreground">
                {loading ? "—" : `${successRate.toFixed(1)}%`}
              </div>
              <Progress value={successRate} className="mt-2" aria-label={t("dashboard.successRate")} />
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">
                {t("dashboard.tests")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("dashboard.passedTests")}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {loading ? "—" : passedTests}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("dashboard.failedTests")}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {loading ? "—" : failedTests}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">
                {t("dashboard.averageExecutionTime")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {loading ? "—" : normalizeTimeToSeconds(averageExecutionTime)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* QA KPIs with colors */}
      <section aria-labelledby="qa-kpis-heading">
        <h2 id="qa-kpis-heading" className="text-lg font-semibold text-foreground mb-4">
          {t("dashboard.qaKpis")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="h-full flex flex-col border-l-4 border-l-amber-500 dark:border-l-amber-400">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">
                {t("dashboard.changeFailureRate")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.cfrHelp")}</p>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {loadingKpis ? "—" : changeFailureRate != null ? `${Number(changeFailureRate).toFixed(1)}%` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">{t("dashboard.mttr")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.mttrHelp")}</p>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loadingKpis ? "—" : mttrHours != null ? `${Number(mttrHours).toFixed(1)} h` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col border-l-4 border-l-violet-500 dark:border-l-violet-400">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">{t("dashboard.mttd")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.mttdHelp")}</p>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {loadingKpis ? "—" : mttdHours != null ? `${Number(mttdHours).toFixed(1)} h` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col border-l-4 border-l-red-500 dark:border-l-red-400">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-foreground">
                {t("dashboard.openBugs")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 mt-auto">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span>{t("bugs.statusOpen")}</span>
                  </span>
                  <span className="font-semibold text-red-500">
                    {loadingKpis ? "—" : kpis?.bugs?.open ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span>{t("bugs.statusInProgress")}</span>
                  </span>
                  <span className="font-semibold text-purple-500">
                    {loadingKpis ? "—" : kpis?.bugs?.inProgress ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{t("bugs.statusResolved")}</span>
                  </span>
                  <span className="font-semibold text-green-500">
                    {loadingKpis ? "—" : kpis?.bugs?.resolved ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3 w-3 text-gray-400" />
                    <span>{t("bugs.statusClosed")}</span>
                  </span>
                  <span className="font-semibold text-gray-400">
                    {loadingKpis ? "—" : kpis?.bugs?.closed ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie charts: Severity + Priority + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">{t("dashboard.bugsBySeverity")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground">Loading…</div>
              ) : severityPieData.length > 0 ? (
                <div className="h-52" role="img" aria-label={t("dashboard.bugsBySeverity")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {severityPieData.map((entry, i) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  {t("dashboard.noBugsBySeverity")}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">{t("dashboard.bugsByPriority")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground">Loading…</div>
              ) : priorityPieData.length > 0 ? (
                <div className="h-52" role="img" aria-label={t("dashboard.bugsByPriority")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {priorityPieData.map((entry, i) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  {t("dashboard.noBugsBySeverity")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">{t("dashboard.bugsByType")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground">Loading…</div>
              ) : typePieData.length > 0 ? (
                <div className="h-52" role="img" aria-label={t("dashboard.bugsByType")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {typePieData.map((entry, i) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  {t("dashboard.noBugsBySeverity")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Heatmap: bugs by day */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t("dashboard.bugsHeatmap")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingKpis ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">Loading…</div>
            ) : (
              <BugsHeatmap data={bugsHeatmap} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
