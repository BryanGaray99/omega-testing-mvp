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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalExecutions}</div>
          <p className="text-xs text-muted-foreground">
            All time executions
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
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
          <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
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
          <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalScenarios}</div>
          <p className="text-xs text-muted-foreground">
            {statistics.totalPassed} passed, {statistics.totalFailed} failed
          </p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Execution Status Overview</CardTitle>
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
