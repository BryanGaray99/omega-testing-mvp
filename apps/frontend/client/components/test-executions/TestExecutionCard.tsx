import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { replaceParams } from '@/lib/translations';
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
  Trash2,
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
  projectName,
  openDropdownId,
  setOpenDropdownId
}: TestExecutionCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const displayProjectName = projectName ?? t("exec.currentProject");

  const getStatusColor = (status: TestExecutionStatus) => {
    switch (status) {
      case TestExecutionStatus.COMPLETED:
        return 'bg-green-100 dark:bg-[#064E3B] text-green-800 dark:text-[#34D399] border-green-200 dark:border-[#065F46]';
      case TestExecutionStatus.FAILED:
        return 'bg-red-100 dark:bg-[#3F1D1D] text-red-800 dark:text-[#F87171] border-red-200 dark:border-[#7F1D1D]';
      case TestExecutionStatus.RUNNING:
        return 'bg-blue-100 dark:bg-[#1E3A8A] text-blue-800 dark:text-[#93C5FD] border-blue-200 dark:border-[#1D4ED8]';
      case TestExecutionStatus.PENDING:
        return 'bg-yellow-100 dark:bg-[#3F2A0E] text-yellow-800 dark:text-[#FBBF24] border-yellow-200 dark:border-[#92400E]';
      case TestExecutionStatus.CANCELLED:
        return 'bg-gray-100 dark:bg-[#1F2937] text-gray-800 dark:text-[#9CA3AF] border-gray-200 dark:border-[#334155]';
      default:
        return 'bg-gray-100 dark:bg-[#1F2937] text-gray-800 dark:text-[#9CA3AF] border-gray-200 dark:border-[#334155]';
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
                className={`h-8 w-8 p-0 text-foreground hover:text-foreground ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(execution)}>
                <Eye className="h-4 w-4 mr-2" />
                {t("exec.viewDetails")}
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  className="text-white [&_svg]:text-[#F87171]"
                  onClick={() => onDelete(execution)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("exec.deleteExecution")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Structure */}
        <div className="space-y-1 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">{t("exec.project")}</span>
            <span>{displayProjectName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{t("exec.section")}</span>
            <span>{execution.section || execution.testCaseTestType || execution.testType || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{t("exec.entity")}</span>
            <span>{execution.entityName || 'N/A'}</span>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-green-50 dark:bg-[#052E26] rounded border border-green-200 dark:border-[#065F46]">
            <div className="text-lg font-bold text-green-600 dark:text-[#34D399]">{execution.passedScenarios}</div>
            <div className="text-xs text-green-700 dark:text-[#34D399]">{t("exec.scenariosPassed")}</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-[#3F1D1D] rounded border border-red-200 dark:border-[#7F1D1D]">
            <div className="text-lg font-bold text-red-600 dark:text-[#F87171]">{execution.failedScenarios}</div>
            <div className="text-xs text-red-700 dark:text-[#F87171]">{t("exec.scenariosFailed")}</div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="space-y-2 text-sm">
          {/* Only show Test Case ID, Method, and Test Type for individual test case executions */}
          {!execution.testSuiteId && execution.testCaseId && execution.testCaseId !== 'N/A' && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("exec.testCaseId")}</span>
              <span className="font-medium">{execution.testCaseId}</span>
            </div>
          )}
          {!execution.testSuiteId && (execution.method || execution.testCaseMethod) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("exec.method")}</span>
              <span className="font-medium">{execution.testCaseMethod || execution.method}</span>
            </div>
          )}
          {!execution.testSuiteId && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("exec.testType")}</span>
              <span className="font-medium">{execution.testCaseTestType || execution.testType}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("exec.duration")}</span>
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span className="font-medium">{formatDuration(execution.executionTime)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("exec.started")}</span>
            <span className="font-medium">{formatDate(execution.startedAt)}</span>
          </div>
          {execution.stepSuccessRate !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("exec.stepSuccessRate")}</span>
              <span className="font-medium">{execution.stepSuccessRate}%</span>
            </div>
          )}
          {execution.resultsCount && execution.resultsCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("exec.resultsCount")}</span>
              <span className="font-medium">{replaceParams(t("exec.resultsScenarios"), { count: String(execution.resultsCount) })}</span>
            </div>
          )}
        </div>

        {/* Error Message Preview */}
        {execution.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-[#3F1D1D] border border-red-200 dark:border-[#7F1D1D] rounded text-xs">
            <div className="flex items-center gap-1 text-red-700 dark:text-[#FCA5A5] mb-1">
              <XCircle className="h-3 w-3" />
              <span className="font-medium">{t("exec.errorLabel")}</span>
            </div>
            <p className="text-red-600 dark:text-[#FCA5A5] line-clamp-2">
              {execution.errorMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

