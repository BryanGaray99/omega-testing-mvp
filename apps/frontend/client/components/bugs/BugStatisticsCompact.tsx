import { useTranslation } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BugStatistics as BugStatisticsType } from "@/components/types/bug.types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bug, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { 
  priorityChartColors, 
  severityChartColors, 
  statusChartColors, 
  getStatusColor,
  getPriorityColor,
  getSeverityColor 
} from "@/lib/colors";

interface BugStatisticsCompactProps {
  statistics: BugStatisticsType;
}

// Recharts Pie Chart Component
const PieChartComponent = ({ data, size = 80 }: { data: { name: string; value: number; color: string }[], size?: number }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={size * 0.4}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}`, name]}
              labelFormatter={(label) => label}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center total */}
      <div className="text-xs font-medium text-foreground">
        {data.reduce((sum, item) => sum + item.value, 0)}
      </div>
    </div>
  );
};

export function BugStatisticsCompact({ statistics }: BugStatisticsCompactProps) {
  const { t } = useTranslation();
  // Early return if statistics is not available
  if (!statistics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">{t("bugs.loadingStatistics")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = statistics.total;

  // Prepare data for pie charts
  const priorityData = [
    { name: t('bugs.severityCritical'), value: statistics.byPriority?.critical || 0, color: priorityChartColors[3] },
    { name: t('bugs.severityHigh'), value: statistics.byPriority?.high || 0, color: priorityChartColors[2] },
    { name: t('bugs.severityMedium'), value: statistics.byPriority?.medium || 0, color: priorityChartColors[1] },
    { name: t('bugs.severityLow'), value: statistics.byPriority?.low || 0, color: priorityChartColors[0] }
  ];

  const severityData = [
    { name: t('bugs.severityCritical'), value: statistics.bySeverity?.critical || 0, color: severityChartColors[3] },
    { name: t('bugs.severityHigh'), value: statistics.bySeverity?.high || 0, color: severityChartColors[2] },
    { name: t('bugs.severityMedium'), value: statistics.bySeverity?.medium || 0, color: severityChartColors[1] },
    { name: t('bugs.severityLow'), value: statistics.bySeverity?.low || 0, color: severityChartColors[0] }
  ];

  const typeData = [
    { name: t('bugs.typeSystemBug'), value: statistics.byType?.system_bug || 0, color: '#ef4444' },
    { name: t('bugs.typeFrameworkError'), value: statistics.byType?.framework_error || 0, color: '#8b5cf6' },
    { name: t('bugs.typeTestFailure'), value: statistics.byType?.test_failure || 0, color: '#3b82f6' },
    { name: t('bugs.typeEnvironmentIssue'), value: statistics.byType?.environment_issue || 0, color: '#10b981' }
  ];

  return (
    <div className="space-y-4">
      {/* Total Bugs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>{t("bugs.totalBugs")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("bugs.reportedAcrossProjects")}
          </p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("bugs.statusOverview")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-[#F87171]" />
              <span className="text-sm">{t("bugs.statusOpen")}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor('open').bg} ${getStatusColor('open').text} ${getStatusColor('open').border}`}>
              {statistics.open}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-sm">{t("bugs.statusInProgress")}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor('in_progress').bg} ${getStatusColor('in_progress').text} ${getStatusColor('in_progress').border}`}>
              {statistics.inProgress}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-[#34D399]" />
              <span className="text-sm">{t("bugs.statusResolved")}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor('resolved').bg} ${getStatusColor('resolved').text} ${getStatusColor('resolved').border}`}>
              {statistics.resolved}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-sm">{t("bugs.statusClosed")}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor('closed').bg} ${getStatusColor('closed').text} ${getStatusColor('closed').border}`}>
              {statistics.closed}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution - Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">{t("bugs.priorityDistribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChartComponent data={priorityData} />
        </CardContent>
      </Card>

      {/* Severity Distribution - Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">{t("bugs.severityDistribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChartComponent data={severityData} />
        </CardContent>
      </Card>

      {/* Type Distribution - Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">{t("bugs.typeDistribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChartComponent data={typeData} />
        </CardContent>
      </Card>
    </div>
  );
}
