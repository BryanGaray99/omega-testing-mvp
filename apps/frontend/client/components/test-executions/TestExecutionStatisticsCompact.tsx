import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { normalizeTimeToSeconds } from '@/lib/utils';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { TestExecutionStatistics } from '@/components/types/test-execution.types';

interface TestExecutionStatisticsCompactProps {
  statistics: TestExecutionStatistics;
}

export function TestExecutionStatisticsCompact({ statistics }: TestExecutionStatisticsCompactProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-[#064E3B] text-green-800 dark:text-[#34D399] border-green-200 dark:border-[#065F46]';
      case 'failed':
        return 'bg-red-100 dark:bg-[#3F1D1D] text-red-800 dark:text-[#F87171] border-red-200 dark:border-[#7F1D1D]';
      case 'running':
        return 'bg-blue-100 dark:bg-[#1E3A8A] text-blue-800 dark:text-[#93C5FD] border-blue-200 dark:border-[#1D4ED8]';
      case 'pending':
        return 'bg-yellow-100 dark:bg-[#3F2A0E] text-yellow-800 dark:text-[#FBBF24] border-yellow-200 dark:border-[#92400E]';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-[#1F2937] text-gray-800 dark:text-[#9CA3AF] border-gray-200 dark:border-[#334155]';
      default:
        return 'bg-gray-100 dark:bg-[#1F2937] text-gray-800 dark:text-[#9CA3AF] border-gray-200 dark:border-[#334155]';
    }
  };

  const formatDuration = (time: number) => {
    return normalizeTimeToSeconds(time); // Auto-detect unit
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Total Executions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{statistics.totalExecutions}</div>
          <p className="text-xs text-muted-foreground">
            All time executions
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {Math.round(statistics.successRate)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.totalPassed} successful
          </p>
        </CardContent>
      </Card>

      {/* Average Execution Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Execution Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatDuration(statistics.averageExecutionTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            Per execution
          </p>
        </CardContent>
      </Card>

      {/* Total Scenarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Scenarios</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{statistics.totalScenarios}</div>
          <p className="text-xs text-muted-foreground">
            {statistics.totalPassed} passed, {statistics.totalFailed} failed
          </p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Execution Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statistics.statusDistribution).map(([status, count]) => (
              <Badge key={status} variant="outline" className={getStatusColor(status)}>
                {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                {status === 'running' && <Activity className="h-3 w-3 mr-1" />}
                {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {status === 'cancelled' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {count} {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
