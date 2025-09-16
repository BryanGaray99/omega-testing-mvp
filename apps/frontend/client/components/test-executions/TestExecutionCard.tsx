import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { normalizeTimeToSeconds } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Eye,
  Calendar,
  Activity,
  Timer,
  Target,
  TrendingUp,
  TrendingDown,
  Trash,
} from 'lucide-react';
import { TestExecution, TestExecutionStatus } from '@/components/types/test-execution.types';

interface TestExecutionCardProps {
  execution: TestExecution;
  onViewDetails: (execution: TestExecution) => void;
  onDelete?: (execution: TestExecution) => void;
  onNavigateToTestExecution?: (executionId: string) => void;
  projectName?: string;
  openDropdownId?: string | null;
  setOpenDropdownId?: (id: string | null) => void;
}

export function TestExecutionCard({ 
  execution, 
  onViewDetails,
  onDelete,
  onNavigateToTestExecution,
  projectName = 'Current Project',
  openDropdownId,
  setOpenDropdownId
}: TestExecutionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: TestExecutionStatus) => {
    switch (status) {
      case TestExecutionStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case TestExecutionStatus.FAILED:
        return 'bg-red-100 text-red-800 border-red-200';
      case TestExecutionStatus.RUNNING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TestExecutionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TestExecutionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TestExecutionStatus) => {
    switch (status) {
      case TestExecutionStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case TestExecutionStatus.FAILED:
        return <XCircle className="h-4 w-4" />;
      case TestExecutionStatus.RUNNING:
        return <Activity className="h-4 w-4" />;
      case TestExecutionStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case TestExecutionStatus.CANCELLED:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (time: number) => {
    return normalizeTimeToSeconds(time); // Auto-detect unit
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = () => {
    if (execution.totalScenarios === 0) return 0;
    return Math.round((execution.passedScenarios / execution.totalScenarios) * 100);
  };

  // Generate descriptive title
  const getExecutionTitle = () => {
    // Check if this is a test suite by looking at testSuiteId
    if (execution.testSuiteId && execution.testSuiteId !== 'N/A') {
      // For test suites, use the testSuiteName if available, otherwise extract from testSuiteId
      let suiteName = execution.testSuiteId;
      
      // First, try to use the testSuiteName from the backend
      if (execution.testSuiteName && execution.testSuiteName !== 'N/A') {
        suiteName = execution.testSuiteName;
      } else {
        // Fallback: extract a readable name from the testSuiteId
        if (execution.testSuiteId.startsWith('SUITE-')) {
          const parts = execution.testSuiteId.split('-');
          if (parts.length >= 3) {
            const section = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1).toLowerCase();
            const entity = parts[2]?.charAt(0).toUpperCase() + parts[2]?.slice(1).toLowerCase();
            suiteName = `${section} ${entity} Test Suite`;
          }
        } else if (execution.testSuiteId.startsWith('PLAN-')) {
          const parts = execution.testSuiteId.split('-');
          if (parts.length >= 2) {
            const section = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1).toLowerCase();
            suiteName = `${section} Test Plan`;
          }
        }
      }
      
      return `Test Execution of ${suiteName}`;
    }
    
    // For individual test cases - prioritize scenario name
    if (execution.specificScenario && execution.specificScenario !== 'N/A') {
      return `Test Execution of ${execution.specificScenario}`;
    }
    if (execution.scenarioName && execution.scenarioName !== 'N/A') {
      return `Test Execution of ${execution.scenarioName}`;
    }
    if (execution.testCaseId && execution.testCaseId !== 'N/A') {
      return `Test Execution of ${execution.testCaseId}`;
    }
    if (execution.entityName && execution.entityName !== 'todos los test cases' && execution.entityName !== 'N/A') {
      return `Test Execution of ${execution.entityName}`;
    }
    return `Test Execution`;
  };

  // Determine if all scenarios passed
  const isAllPassed = execution.failedScenarios === 0 && execution.passedScenarios > 0;
  const hasFailures = execution.failedScenarios > 0;

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Header Row - Title, Status Icon, Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1 line-clamp-2">
              {getExecutionTitle()}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(execution.status)}
              <Badge variant="outline" className={getStatusColor(execution.status)}>
                {execution.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          {/* Actions dropdown */}
          <DropdownMenu
            open={openDropdownId === execution.executionId}
            onOpenChange={(open) => setOpenDropdownId && setOpenDropdownId(open ? execution.executionId : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(execution)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(execution)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Execution
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Structure */}
        <div className="space-y-1 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Project:</span>
            <span>{projectName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Section:</span>
            <span>{execution.section || execution.testCaseTestType || execution.testType || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Entity:</span>
            <span>{execution.entityName || 'N/A'}</span>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="text-lg font-bold text-green-600">{execution.passedScenarios}</div>
            <div className="text-xs text-green-700">Scenarios Passed</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
            <div className="text-lg font-bold text-red-600">{execution.failedScenarios}</div>
            <div className="text-xs text-red-700">Scenarios Failed</div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="space-y-2 text-sm">
          {/* Only show Test Case ID, Method, and Test Type for individual test case executions */}
          {!execution.testSuiteId && execution.testCaseId && execution.testCaseId !== 'N/A' && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Test Case ID:</span>
              <span className="font-medium">{execution.testCaseId}</span>
            </div>
          )}
          {!execution.testSuiteId && (execution.method || execution.testCaseMethod) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium">{execution.testCaseMethod || execution.method}</span>
            </div>
          )}
          {!execution.testSuiteId && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Test Type:</span>
              <span className="font-medium">{execution.testCaseTestType || execution.testType}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span className="font-medium">{formatDuration(execution.executionTime)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">{formatDate(execution.startedAt)}</span>
          </div>
          {execution.stepSuccessRate !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Step Success Rate:</span>
              <span className="font-medium">{execution.stepSuccessRate}%</span>
            </div>
          )}
          {execution.resultsCount && execution.resultsCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Results:</span>
              <span className="font-medium">{execution.resultsCount} scenario(s)</span>
            </div>
          )}
        </div>

        {/* Error Message Preview */}
        {execution.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center gap-1 text-red-700 mb-1">
              <XCircle className="h-3 w-3" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-600 line-clamp-2">
              {execution.errorMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

