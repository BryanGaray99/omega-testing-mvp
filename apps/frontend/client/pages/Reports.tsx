import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeTimeToSeconds } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Users,
  Zap,
} from "lucide-react";

interface ReportMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  format: "number" | "percentage" | "time";
}

const mockMetrics: ReportMetric[] = [
  {
    label: "Test Coverage",
    value: 87.5,
    change: 5.2,
    trend: "up",
    format: "percentage",
  },
  {
    label: "Success Rate",
    value: 94.2,
    change: -1.8,
    trend: "down",
    format: "percentage",
  },
  {
    label: "Avg. Execution Time",
    value: 145,
    change: -12,
    trend: "up",
    format: "time",
  },
  {
    label: "Tests Executed",
    value: 1247,
    change: 156,
    trend: "up",
    format: "number",
  },
];

const testTrends = [
  { date: "Mon", passed: 145, failed: 8, skipped: 3 },
  { date: "Tue", passed: 152, failed: 5, skipped: 2 },
  { date: "Wed", passed: 148, failed: 12, skipped: 4 },
  { date: "Thu", passed: 167, failed: 3, skipped: 1 },
  { date: "Fri", passed: 159, failed: 7, skipped: 2 },
  { date: "Sat", passed: 142, failed: 4, skipped: 1 },
  { date: "Sun", passed: 134, failed: 2, skipped: 3 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("7d");
  const [projectFilter, setProjectFilter] = useState("all");

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "percentage":
        return `${value}%`;
      case "time":
        return normalizeTimeToSeconds(value * 1000); // Auto-detect unit
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-muted-foreground">
            Comprehensive insights into your testing performance and trends
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="auth">Auth Service</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.format)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    metric.change > 0
                      ? "text-success"
                      : metric.change < 0
                        ? "text-error"
                        : "text-muted-foreground"
                  }
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}
                  {metric.format === "percentage" ? "%" : ""}
                </span>{" "}
                from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Passed</span>
                    </div>
                    <span className="text-sm font-medium">1,147 (89.2%)</span>
                  </div>
                  <Progress value={89.2} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-error" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <span className="text-sm font-medium">67 (5.2%)</span>
                  </div>
                  <Progress value={5.2} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Skipped</span>
                    </div>
                    <span className="text-sm font-medium">72 (5.6%)</span>
                  </div>
                  <Progress value={5.6} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Failing Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Top Failing Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "User Login Validation", failures: 8, rate: 12.5 },
                    { name: "Payment Processing", failures: 6, rate: 18.2 },
                    { name: "Product Search", failures: 4, rate: 8.1 },
                    { name: "Cart Management", failures: 3, rate: 6.7 },
                  ].map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.failures} failures
                        </p>
                      </div>
                      <Badge variant="destructive">{test.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Execution Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  Chart visualization would be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Overall Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">87.5%</div>
                <Progress value={87.5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>API Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92.1%</div>
                <Progress value={92.1} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  67 of 73 endpoints
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Feature Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78.3%</div>
                <Progress value={78.3} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  47 of 60 features
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Execution Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Average Duration:
                    </span>
                    <span className="font-medium">2m 45s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Fastest Test:
                    </span>
                    <span className="font-medium">0.8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Slowest Test:
                    </span>
                    <span className="font-medium">1m 23s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Runtime:
                    </span>
                    <span className="font-medium">4h 12m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Resource Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Network I/O</span>
                      <span className="text-sm">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
