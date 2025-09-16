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
import { TestCase } from '@/components/types/testCase.types';
import ScenarioEditor from './ScenarioEditor';
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
  AlertCircle,
  Calendar,
  FileText,
  Tag,
  TestTube,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { updateTestCaseScenario } from '@/services/testCaseService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TestCaseComprehensiveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTestCase: TestCase | null;
  editingTestCase: TestCase | null;
  setEditingTestCase: (testCase: TestCase | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isUpdating: boolean;
  projects: any[];
  onUpdate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onEditSteps: () => void;
  reloadData: () => Promise<void>;
  reloadDataAndUpdateTestCase: (testCaseId: string) => Promise<void>;
  onEditScenario: () => void;
  onNavigateToExecution?: (executionId: string) => void;
}

export default function TestCaseComprehensiveDialog({
  isOpen,
  onOpenChange,
  selectedTestCase,
  editingTestCase,
  setEditingTestCase,
  isEditing,
  setIsEditing,
  isUpdating,
  projects,
  onUpdate,
  onDelete,
  onClose,
  onEditSteps,
  reloadData,
  reloadDataAndUpdateTestCase,
  onEditScenario,
  onNavigateToExecution,
}: TestCaseComprehensiveDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditingScenario, setIsEditingScenario] = useState(false);
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [loadingLastExecution, setLoadingLastExecution] = useState(false);

  // Cargar la última ejecución cuando se abre el modal
  useEffect(() => {
    if (isOpen && selectedTestCase && selectedTestCase.projectId) {
      loadLastExecution();
    }
  }, [isOpen, selectedTestCase]);

  // Handle opening dialog with specific tab and scenario editing
  useEffect(() => {
    if (isOpen && selectedTestCase) {
      // Check if we should open in a specific tab
      const desiredTab = sessionStorage.getItem('openDialogTab');
      if (desiredTab && ['basic', 'scenario', 'execution'].includes(desiredTab)) {
        setActiveTab(desiredTab);
        sessionStorage.removeItem('openDialogTab');
      }

      // Si el modal se abrió desde "Edit Test Case", activar la edición del escenario
      const shouldEditScenario = sessionStorage.getItem('editScenario') === 'true';
      if (shouldEditScenario) {
        setIsEditingScenario(true);
        sessionStorage.removeItem('editScenario');
      }
    }
  }, [isOpen, selectedTestCase]);

  const loadLastExecution = async () => {
    if (!selectedTestCase?.projectId || !selectedTestCase?.testCaseId) return;
    
    setLoadingLastExecution(true);
    try {
      const execution = await testExecutionService.getLastExecutionByTestCase(
        selectedTestCase.projectId,
        selectedTestCase.testCaseId
      );
      setLastExecution(execution);
    } catch (error) {
      console.log('No last execution found for this test case:', error);
      setLastExecution(null);
    } finally {
      setLoadingLastExecution(false);
    }
  };

  if (!selectedTestCase) return null;

  const testCase = editingTestCase || selectedTestCase;
  const project = projects.find(p => p.id === testCase.projectId);

  const getTestTypeColor = (testType: string) => {
    switch (testType) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PUT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getExecutionStatusIcon = (lastRunStatus?: string, lastRun?: string) => {
    if (!lastRun) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    
    switch (lastRunStatus) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExecutionStatusText = (lastRunStatus?: string, lastRun?: string) => {
    if (!lastRun) {
      return "PENDING";
    }
    
    switch (lastRunStatus) {
      case "passed":
        return "PASSED";
      case "failed":
        return "FAILED";
      default:
        return "UNKNOWN";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatScenario = (scenario: string) => {
    return scenario.split('\n').map((line, index) => (
      <div key={index} className="mb-1">
        <span className="font-mono text-sm">{line}</span>
      </div>
    ));
  };

  const handleScenarioSave = async (steps: any[], tags: string[], scenario: string) => {
    try {
      // Update the test case using the new endpoint
      await updateTestCaseScenario(
        testCase.testCaseId,
        testCase.projectId,
        {
          tags: tags,
          scenario: scenario, // Usar el escenario completo que incluye Examples
        }
      );
      
      // Show success message
      toast({
        title: "Success",
        description: "Test case scenario updated successfully",
      });
      
      // Solo salir del modo de edición del scenario, no cerrar el modal
      setIsEditingScenario(false);
      
      // Recargar la data y actualizar el test case seleccionado
      await reloadDataAndUpdateTestCase(testCase.testCaseId);
    } catch (error) {
      console.error("Error updating test case scenario:", error);
      toast({
        title: "Error",
        description: "Failed to update test case scenario",
        variant: "destructive",
      });
    }
  };

  const handleScenarioCancel = () => {
    setIsEditingScenario(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Si está en modo de edición, cancelar la edición pero mantener el modal abierto
      if (isEditing) {
        setIsEditing(false);
        setEditingTestCase(selectedTestCase);
        // No cerrar el modal, solo cancelar la edición
        return;
      }
      // Si está editando el scenario, cancelar la edición del scenario pero mantener el modal abierto
      if (isEditingScenario) {
        setIsEditingScenario(false);
        // No cerrar el modal, solo cancelar la edición
        return;
      }
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            {selectedTestCase?.name || "Test Case Details"}
          </DialogTitle>
          <DialogDescription>
            View test case details, execution history, and edit scenario information.
          </DialogDescription>
        </DialogHeader>
        
        {isEditingScenario ? (
          <ScenarioEditor
            testCase={testCase}
            projectId={testCase.projectId}
            onSave={handleScenarioSave}
            onCancel={handleScenarioCancel}
            isPending={isUpdating}
          />
        ) : (
          <>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="scenario">Scenario</TabsTrigger>
                <TabsTrigger value="execution">Execution</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Test Case Details */}
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">Test Case Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Test Case ID</label>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                            {testCase.testCaseId}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Project</label>
                          <p className="text-sm">{project?.displayName || testCase.projectId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Section</label>
                          {isEditing ? (
                            <Input
                              value={editingTestCase?.section || ''}
                              onChange={(e) => {
                                if (editingTestCase) {
                                  setEditingTestCase({
                                    ...editingTestCase,
                                    section: e.target.value
                                  });
                                }
                              }}
                              className="text-sm"
                            />
                          ) : (
                            <p className="text-sm">{testCase.section}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entity</label>
                          {isEditing ? (
                            <Input
                              value={editingTestCase?.entityName || ''}
                              onChange={(e) => {
                                if (editingTestCase) {
                                  setEditingTestCase({
                                    ...editingTestCase,
                                    entityName: e.target.value
                                  });
                                }
                              }}
                              className="text-sm"
                            />
                          ) : (
                            <p className="text-sm">{testCase.entityName}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          {isEditing ? (
                            <Input
                              value={editingTestCase?.name || ''}
                              onChange={(e) => {
                                if (editingTestCase) {
                                  setEditingTestCase({
                                    ...editingTestCase,
                                    name: e.target.value
                                  });
                                }
                              }}
                              className="text-sm"
                            />
                          ) : (
                            <p className="text-sm">{testCase.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <p className="text-sm">{testCase.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test Configuration */}
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">Test Configuration</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Test Type</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(testCase.testType)}`}>
                            {testCase.testType}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Method</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(testCase.method)}`}>
                            {testCase.method}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {testCase.description && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </h4>
                        {isEditing ? (
                          <Textarea
                            value={editingTestCase?.description || ''}
                            onChange={(e) => {
                              if (editingTestCase) {
                                setEditingTestCase({
                                  ...editingTestCase,
                                  description: e.target.value
                                });
                              }
                            }}
                            className="text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm">{testCase.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scenario" className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Gherkin Scenario
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current scenario steps</span>
                    {!isEditing && (
                      <Button
                        size="sm"
                        onClick={() => setIsEditingScenario(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Scenario
                      </Button>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    {formatScenario(testCase.scenario)}
                  </div>
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
                          {getExecutionStatusIcon(testCase.lastRunStatus, testCase.lastRun)}
                          <Badge variant="outline">
                            {getExecutionStatusText(testCase.lastRunStatus, testCase.lastRun)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Run</label>
                        <div className="flex items-center gap-2">
                          {lastExecution && lastExecution.executionId && onNavigateToExecution ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onNavigateToExecution(lastExecution.executionId)}
                                    className="text-sm font-medium text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {testCase.lastRun ? formatDate(testCase.lastRun) : "Not executed yet"}
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
                              {testCase.lastRun ? formatDate(testCase.lastRun) : "Not executed yet"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">Timestamps</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm font-medium">{formatDate(testCase.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <span className="text-sm font-medium">{formatDate(testCase.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
                          <DialogFooter>
                {!isEditing ? (
                  <div className="flex gap-2 w-full justify-end">
                    <Button
                      variant="destructive"
                      onClick={onDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Test Case
                    </Button>
                  </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingTestCase(selectedTestCase);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={onUpdate}
                    disabled={isUpdating}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    {isUpdating ? 'Saving...' : 'Update'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 