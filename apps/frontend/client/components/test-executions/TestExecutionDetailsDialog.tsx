import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeTimeToSeconds } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Timer,
  Target,
  Activity,
  FileText,
  Code,
  ExternalLink,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestExecution, TestResult, TestStep, TestExecutionStatus, TestResultStatus, TestStepStatus } from '@/components/types/test-execution.types';
import { testExecutionService } from '@/services/testExecutionService';

interface TestExecutionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  execution: TestExecution | null;
  projectId: string;
  onNavigateToTestCase?: (testCaseId: string) => void;
  onNavigateToTestSuite?: (testSuiteId: string) => void;
}

export default function TestExecutionDetailsDialog({
  isOpen,
  onOpenChange,
  execution,
  projectId,
  onNavigateToTestCase,
  onNavigateToTestSuite,
}: TestExecutionDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('execution-info');
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Use the execution data directly since it now contains all the information
  const hasExecutionData = execution && (
    (execution.allSteps && execution.allSteps.length > 0) ||
    (execution.scenariosStructure && execution.scenariosStructure.length > 0)
  );

  const hasTestResultsData = execution && (
    execution.status ||
    execution.totalScenarios ||
    execution.passedScenarios ||
    execution.failedScenarios ||
    execution.totalSteps ||
    execution.passedSteps ||
    execution.failedSteps
  );

  // Handle dialog close with cleanup
  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
  };

  // Cleanup effect when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setExpandedResults(new Set());
      setActiveTab('execution-info');
    }
  }, [isOpen]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset state when component unmounts
      setExpandedResults(new Set());
      setActiveTab('execution-info');
    };
  }, []);



  const getStatusColor = (status: TestExecutionStatus | TestResultStatus | TestStepStatus) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TestExecutionStatus | TestResultStatus | TestStepStatus) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'running':
        return <Activity className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'skipped':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (time: number) => {
    return normalizeTimeToSeconds(time); // Auto-detect unit
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSuccessRate = () => {
    if (!execution || execution.totalScenarios === 0) return 0;
    return Math.round((execution.passedScenarios / execution.totalScenarios) * 100);
  };

  const parseSteps = (stepsJson: string): TestStep[] => {
    try {
      const parsed = JSON.parse(stepsJson);
      // Handle the new format with stepName, isHook, hookType, etc.
      return parsed.map((step: any) => ({
        name: step.stepName || step.name || 'Unknown Step',
        status: step.status || 'pending',
        duration: step.duration || 0,
        errorMessage: step.errorMessage || null,
        metadata: {
          timestamp: step.timestamp,
          isHook: step.isHook || false,
          hookType: step.hookType || null,
          ...step.metadata
        }
      }));
    } catch (error) {
      console.error('Error parsing steps:', error);
      return [];
    }
  };

  const toggleResultExpansion = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  // Component for rendering steps table with collapsible error messages
  function StepsTable({ steps }: { steps: TestStep[] }) {
    const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

    const toggleError = (index: number) => {
      const newExpanded = new Set(expandedErrors);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedErrors(newExpanded);
    };

    if (!steps || steps.length === 0) {
      return <p className="text-sm text-muted-foreground">No steps data available</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Step Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Error Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step, index) => (
            <TableRow key={index} className={
              step.isHook ? 'bg-gray-50' : ''
            }>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {step.isHook ? (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {step.hookType || 'Hook'}
                    </Badge>
                  ) : null}
                  {step.stepName}
                </div>
              </TableCell>
              <TableCell>
                {step.isHook ? (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Hook
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Step
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(step.status)}>
                  {getStatusIcon(step.status)}
                  <span className="ml-1">{step.status.toUpperCase()}</span>
                </Badge>
              </TableCell>
              <TableCell>{formatDuration(step.duration)}</TableCell>
              <TableCell>
                {step.timestamp ? (
                  <span className="text-xs text-muted-foreground">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {step.errorMessage ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-red-600 hover:text-red-700"
                      onClick={() => toggleError(index)}
                    >
                      <div className="flex items-center gap-1">
                        {expandedErrors.has(index) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        <span className="text-xs">View Error</span>
                      </div>
                    </Button>
                    {expandedErrors.has(index) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 max-w-xs">
                        <pre className="whitespace-pre-wrap break-words">{step.errorMessage}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Don't render if no execution is selected or dialog is not open
  if (!execution || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Execution Details
          </DialogTitle>
          <DialogDescription>
            Execution ID: {execution.executionId}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="execution-info">Execution Info</TabsTrigger>
            <TabsTrigger value="test-results">Test Results</TabsTrigger>
            <TabsTrigger value="steps-details">Steps Details</TabsTrigger>
          </TabsList>

          <TabsContent value="execution-info" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Execution Details */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Execution Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className={getStatusColor(execution.status)}>
                      {getStatusIcon(execution.status)}
                      <span className="ml-1">{execution.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Entity:</span>
                    <span className="text-sm">{execution.entityName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Section:</span>
                    <span className="text-sm">{execution.section || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Feature:</span>
                    <span className="text-sm">{execution.feature || 'N/A'}</span>
                  </div>
                  {execution.totalScenarios === 1 ? (
                    // For individual test cases
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test Case ID:</span>
                        <span className="text-sm">
                          {execution.testCaseId && execution.testCaseId !== 'N/A' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onNavigateToTestCase?.(execution.testCaseId!)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {execution.testCaseId}
                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Navigate to Test Case</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            'N/A'
                          )}
                        </span>
                      </div>

                      {execution.scenarioName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Scenario:</span>
                          <span className="text-sm">{execution.scenarioName}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    // For test suites
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <span className="text-sm">Test Suite</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Scenarios:</span>
                        <span className="text-sm">{execution.totalScenarios} scenarios</span>
                      </div>
                      {execution.specificScenario && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Scenarios List:</span>
                          <span className="text-sm text-right max-w-xs">
                            {execution.specificScenario.split(',').map((scenario, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                {scenario.trim()}
                              </div>
                            ))}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test Suite ID:</span>
                        <span className="text-sm">
                          {execution.testSuiteId && execution.testSuiteId !== 'N/A' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onNavigateToTestSuite?.(execution.testSuiteId!)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {execution.testSuiteId}
                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Navigate to Test Suite</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            'N/A'
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Scenarios:</span>
                    <span className="text-sm font-bold">{execution.totalScenarios}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Passed:</span>
                    <span className="text-sm font-bold text-green-600">{execution.passedScenarios}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Failed:</span>
                    <span className="text-sm font-bold text-red-600">{execution.failedScenarios}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate:</span>
                    <span className="text-sm font-bold">{getSuccessRate()}%</span>
                  </div>
                  {execution.totalSteps && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Steps:</span>
                      <span className="text-sm font-bold">{execution.totalSteps}</span>
                    </div>
                  )}
                  {execution.passedSteps !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Steps Passed:</span>
                      <span className="text-sm font-bold text-green-600">{execution.passedSteps}</span>
                    </div>
                  )}
                  {execution.failedSteps !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Steps Failed:</span>
                      <span className="text-sm font-bold text-red-600">{execution.failedSteps}</span>
                    </div>
                  )}
                  {execution.stepSuccessRate !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Step Success Rate:</span>
                      <span className="text-sm font-bold">{execution.stepSuccessRate}%</span>
                    </div>
                  )}
                  {execution.executionTime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{formatDuration(execution.executionTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Timestamps</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-medium">Started At:</span>
                  <p className="text-sm">{formatDate(execution.startedAt)}</p>
                </div>
                {execution.completedAt && (
                  <div>
                    <span className="text-sm font-medium">Completed At:</span>
                    <p className="text-sm">{formatDate(execution.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {execution.errorMessage && (
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Error Message</h4>
                <div className="text-sm bg-red-50 border border-red-200 rounded p-2">
                  {execution.errorMessage}
                </div>
              </div>
            )}

            {/* Metadata */}
            {execution.metadata && (
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="text-sm bg-muted rounded p-2 font-mono">
                  <pre className="whitespace-pre-wrap">
                    {typeof execution.metadata === 'string' 
                      ? execution.metadata 
                      : JSON.stringify(execution.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="test-results" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Test Results</h4>
              {!hasTestResultsData ? (
                <div className="text-center py-4 text-muted-foreground">No test results found</div>
              ) : (
                <div className="space-y-4">
                  {execution.totalScenarios === 1 ? (
                    // For individual test cases
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2">Scenario: {execution?.scenarioName}</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Status:</span>
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(execution?.status || TestExecutionStatus.PENDING)}`}>
                            {getStatusIcon(execution?.status || TestExecutionStatus.PENDING)}
                            <span className="ml-1">{execution?.status?.toUpperCase()}</span>
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{formatDuration(execution?.executionTime || 0)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Test Case ID:</span>
                          <span className="ml-2">
                            {execution?.testCaseId && execution.testCaseId !== 'N/A' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => onNavigateToTestCase?.(execution.testCaseId!)}
                                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                    >
                                      {execution.testCaseId}
                                      <ExternalLink className="h-3 w-3 opacity-60" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Navigate to Test Case</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              'N/A'
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Method:</span>
                          <span className="ml-2">{execution?.testCaseMethod || execution?.method || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {/* Error Message */}
                      {execution?.errorMessage && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Error:</span>
                          <div className="text-sm bg-red-50 border border-red-200 rounded p-2 mt-1">
                            {execution.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // For test suites
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium mb-2">Test Suite Summary</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Status:</span>
                            <Badge variant="outline" className={`ml-2 ${getStatusColor(execution?.status || TestExecutionStatus.PENDING)}`}>
                              {getStatusIcon(execution?.status || TestExecutionStatus.PENDING)}
                              <span className="ml-1">{execution?.status?.toUpperCase()}</span>
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <span className="ml-2">{formatDuration(execution?.executionTime || 0)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Total Scenarios:</span>
                            <span className="ml-2">{execution?.totalScenarios}</span>
                          </div>
                          <div>
                            <span className="font-medium">Success Rate:</span>
                            <span className="ml-2">{getSuccessRate()}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Test Suite ID:</span>
                            <span className="ml-2">
                              {execution?.testSuiteId && execution.testSuiteId !== 'N/A' ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => onNavigateToTestSuite?.(execution.testSuiteId!)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                      >
                                        {execution.testSuiteId}
                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Navigate to Test Suite</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                'N/A'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Individual Scenarios */}
                      {execution.specificScenario && (
                        <div className="space-y-2">
                          <h6 className="font-medium text-sm">Individual Scenarios:</h6>
                          {execution.specificScenario.split(',').map((scenarioName, index) => (
                            <div key={index} className="border rounded p-2 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{scenarioName.trim()}</span>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Passed
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Error Message */}
                      {execution?.errorMessage && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Error:</span>
                          <div className="text-sm bg-red-50 border border-red-200 rounded p-2 mt-1">
                            {execution.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="steps-details" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Steps Details</h4>
              {!hasExecutionData ? (
                <div className="text-center py-4 text-muted-foreground">No steps details found</div>
              ) : (
                 <div className="space-y-4">
                   {/* Usar la nueva estructura anidada para TODOS los casos */}
                   {execution && execution.scenariosStructure && execution.scenariosStructure.length > 0 ? (
                     <div className="space-y-4">
                       {execution.scenariosStructure.map((scenario, scenarioIndex) => (
                         <Collapsible key={scenarioIndex} className="border rounded-lg">
                           <CollapsibleTrigger asChild>
                             <Button variant="ghost" className="w-full justify-between p-3">
                               <div className="flex items-center gap-2">
                                 <ChevronRight className="h-4 w-4" />
                                 <span className="font-medium">{scenario.scenarioName}</span>
                                 <Badge variant="outline" className="text-xs">
                                   {scenario.examples.length} {scenario.examples.length === 1 ? 'Example' : 'Examples'}
                                 </Badge>
                               </div>
                             </Button>
                           </CollapsibleTrigger>
                           <CollapsibleContent className="p-3 border-t">
                             <div className="space-y-2">
                               {scenario.examples.map((example, exampleIndex) => (
                                 <Collapsible key={exampleIndex} className="border rounded p-2">
                                   <CollapsibleTrigger asChild>
                                     <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                                       <div className="flex items-center gap-2">
                                         <ChevronRight className="h-4 w-4" />
                                         <span className="text-sm font-medium">{example.exampleName}</span>
                                         <div className="flex items-center gap-2">
                                           <Badge 
                                             variant={example.status === 'passed' ? 'default' : 'destructive'} 
                                             className="text-xs"
                                           >
                                             {example.status}
                                           </Badge>
                                           <Badge variant="outline" className="text-xs">
                                             {example.steps.length} steps
                                           </Badge>
                                         </div>
                                       </div>
                                     </Button>
                                   </CollapsibleTrigger>
                                   <CollapsibleContent className="p-2 border-t">
                                     <StepsTable steps={example.steps} />
                                   </CollapsibleContent>
                                 </Collapsible>
                               ))}
                             </div>
                           </CollapsibleContent>
                         </Collapsible>
                       ))}
                     </div>
                   ) : (
                     // Fallback para casos sin estructura anidada (datos antiguos)
                     <div className="border rounded p-3">
                       <h5 className="font-medium mb-2">{execution?.scenarioName || 'Steps'}</h5>
                       <StepsTable steps={execution?.allSteps || []} />
                     </div>
                   )}
                 </div>
               )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
