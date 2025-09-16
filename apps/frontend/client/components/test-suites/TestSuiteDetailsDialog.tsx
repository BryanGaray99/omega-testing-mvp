import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestSuite } from '@/services/testSuiteService';
import { testExecutionService } from '@/services/testExecutionService';
import { 
  Play, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Tag,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { normalizeTimeToSeconds } from '@/lib/utils';

interface TestSuiteDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTestSuite: TestSuite | null;
  onDelete: () => void;
  onClose: () => void;
  onNavigateToTestCase?: (testCaseId: string) => void;
  onNavigateToTestSet?: (testSetId: string) => void;
  onNavigateToExecution?: (executionId: string) => void;
}

export default function TestSuiteDetailsDialog({
  isOpen,
  onOpenChange,
  selectedTestSuite,
  onDelete,
  onClose,
  onNavigateToTestCase,
  onNavigateToTestSet,
  onNavigateToExecution,
}: TestSuiteDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [loadingLastExecution, setLoadingLastExecution] = useState(false);

  // Cargar la última ejecución cuando se abre el modal
  useEffect(() => {
    console.log('useEffect triggered - isOpen:', isOpen, 'selectedTestSuite:', selectedTestSuite);
    if (isOpen && selectedTestSuite && selectedTestSuite.projectId) {
      loadLastExecution();
    }
  }, [isOpen, selectedTestSuite]);

  const loadLastExecution = async () => {
    if (!selectedTestSuite?.projectId || !selectedTestSuite?.suiteId) return;
    
    console.log('Loading last execution for test suite:', selectedTestSuite.suiteId);
    setLoadingLastExecution(true);
    try {
      const execution = await testExecutionService.getLastExecutionByTestSuite(
        selectedTestSuite.projectId,
        selectedTestSuite.suiteId
      );
      console.log('Last execution loaded:', execution);
      console.log('Execution ID:', execution.executionId);
      console.log('Full execution object:', JSON.stringify(execution, null, 2));
      console.log('onNavigateToExecution function:', !!onNavigateToExecution);
      setLastExecution(execution);
    } catch (error) {
      console.log('No last execution found for this test suite:', error);
      setLastExecution(null);
    } finally {
      setLoadingLastExecution(false);
    }
  };

  if (!selectedTestSuite) return null;

  const testSuite = selectedTestSuite;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'running':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'passed':
        return 'bg-blue-500 text-white hover:bg-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getExecutionStatusIcon = (status?: string) => {
    if (!status || status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {selectedTestSuite?.name || "Test Suite Details"}
          </DialogTitle>
          <DialogDescription>
            View test suite details, execution history, and manage configuration.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Test Suite Details */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Test Suite Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Test Suite ID</label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                        {testSuite.suiteId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project</label>
                      <p className="text-sm">{testSuite.projectId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      <p className="text-sm">{testSuite.section}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity</label>
                      <p className="text-sm">{testSuite.entity || 'N/A (Test Plan)'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">{testSuite.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(testSuite.status)}>
                          {testSuite.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Configuration */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Test Configuration</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {testSuite.type === 'test_set' ? 'Test Set' : 'Test Plan'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Environment</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {testSuite.environment}
                      </span>
                    </div>
                  </div>
                </div>

                                    {/* Description */}
                    {testSuite.description && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </h4>
                        <p className="text-sm">{testSuite.description}</p>
                      </div>
                    )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {testSuite.type === 'test_plan' ? 'Test Sets Content' : 'Test Cases Content'}
              </h4>
              
              {/* Content based on type */}
              {testSuite.type === 'test_set' && testSuite.testCases && testSuite.testCases.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Test Cases ({testSuite.testCases.length})</h5>
                  <div className="space-y-2">
                    {testSuite.testCases.map((testCase, index) => (
                      <div key={index} className="p-2 border rounded bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onNavigateToTestCase?.(testCase.testCaseId)}
                                    className="text-sm font-medium text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {testCase.name}
                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalles del test case</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-muted-foreground">{testCase.testCaseId}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {testCase.section} • {testCase.entityName}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testSuite.type === 'test_plan' && testSuite.testSets && testSuite.testSets.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Test Sets ({testSuite.testSets.length})</h5>
                  <div className="space-y-2">
                    {testSuite.testSets.map((testSet, index) => (
                      <div key={index} className="p-2 border rounded bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onNavigateToTestSet?.(testSet.setId)}
                                    className="text-sm font-medium text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {testSet.name}
                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalles del test set</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-muted-foreground">{testSet.setId}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {testSet.testCases.length} test cases
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {((testSuite.type === 'test_set' && (!testSuite.testCases || testSuite.testCases.length === 0)) ||
                (testSuite.type === 'test_plan' && (!testSuite.testSets || testSuite.testSets.length === 0))) && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No content available for this {testSuite.type === 'test_set' ? 'test set' : 'test plan'}.</p>
                </div>
              )}

              {/* Tags */}
              {testSuite.tags && testSuite.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {testSuite.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Last Execution</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getExecutionStatusIcon(testSuite.status)}
                      <Badge className={getStatusColor(testSuite.status)}>
                        {testSuite.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Executed</label>
                    <div className="flex items-center gap-2">
                      {lastExecution && lastExecution.executionId && onNavigateToExecution ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onNavigateToExecution(lastExecution.executionId)}
                                className="text-sm font-medium text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                              >
                                {testSuite.lastExecutedAt ? formatDate(testSuite.lastExecutedAt) : "Not executed yet"}
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalles de la ejecución</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <p className="text-sm">
                          {testSuite.lastExecutedAt ? formatDate(testSuite.lastExecutedAt) : "Not executed yet"}
                        </p>
                      )}
                    </div>
                  </div>
                  {testSuite.executionTime && testSuite.executionTime > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Execution Time</label>
                      <p className="text-sm">{normalizeTimeToSeconds(testSuite.executionTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">
                  {testSuite.type === 'test_plan' ? 'Test Plan Results' : 'Test Results'}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {testSuite.type === 'test_plan' ? 'Total Cases:' : 'Total:'}
                    </span>
                    <span className="text-sm font-medium">{testSuite.totalTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Passed:</span>
                    <span className="text-sm font-medium text-green-600">{testSuite.passedTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed:</span>
                    <span className="text-sm font-medium text-red-600">{testSuite.failedTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Skipped:</span>
                    <span className="text-sm font-medium text-yellow-600">{testSuite.skippedTestCases}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Timestamps</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm font-medium">{formatDate(testSuite.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Updated:</span>
                    <span className="text-sm font-medium">{formatDate(testSuite.updatedAt)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {testSuite.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Started:</span>
                      <span className="text-sm font-medium">{formatDate(testSuite.startedAt)}</span>
                    </div>
                  )}
                  {testSuite.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed:</span>
                      <span className="text-sm font-medium">{formatDate(testSuite.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Test Suite
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
