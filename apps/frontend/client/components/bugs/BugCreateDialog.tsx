import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Bug, 
  Loader2, 
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { CreateBugDto, BugType, BugSeverity, BugPriority, FailedExecution } from "@/components/types/bug.types";
import { getProjectSectionsAndEntities, getProjectEntities } from "@/services/testCaseService";
import { testSuiteService } from "@/services/testSuiteService";
import { bugService } from "@/services/bugService";

interface ProjectOption {
  id: string;
  name?: string;
  displayName?: string;
}

interface TestCase {
  testCaseId: string;
  name: string;
  entityName: string;
  section: string;
  method?: string;
  testType?: string;
  status?: string;
}

interface BugCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectOption[];
  failedExecutions: FailedExecution[];
  onCreateBug: (bugData: CreateBugDto) => void;
  isCreating: boolean;
}

export default function BugCreateDialog({
  open,
  onOpenChange,
  projects,
  failedExecutions,
  onCreateBug,
  isCreating,
}: BugCreateDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<BugType>(BugType.TEST_FAILURE);
  const [severity, setSeverity] = useState<BugSeverity>(BugSeverity.MEDIUM);
  const [priority, setPriority] = useState<BugPriority>(BugPriority.MEDIUM);
  const [environment, setEnvironment] = useState("default");
  const [section, setSection] = useState("");
  const [entity, setEntity] = useState("");
  const [selectedTestCaseId, setSelectedTestCaseId] = useState("");
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  // Error details states
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorStack, setErrorStack] = useState("");

  // Failed execution states
  const [selectedExecutionId, setSelectedExecutionId] = useState("");
  const [selectedExecution, setSelectedExecution] = useState<FailedExecution | null>(null);
  const [testCaseFailedExecutions, setTestCaseFailedExecutions] = useState<FailedExecution[]>([]);
  const [isLoadingFailedExecutions, setIsLoadingFailedExecutions] = useState(false);

  // Available data states
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (open && selectedProjectId) {
      loadAvailableSectionsAndEntities();
    }
  }, [open, selectedProjectId]);

  // Load entities when section changes
  useEffect(() => {
    if (open && selectedProjectId && section) {
      loadAvailableEntities();
    }
  }, [open, selectedProjectId, section]);

  // Load test cases when section and entity change
  useEffect(() => {
    if (open && selectedProjectId && section && entity) {
      loadAvailableTestCases();
    }
  }, [open, selectedProjectId, section, entity]);

  // Load failed executions when test case is selected
  useEffect(() => {
    if (open && selectedProjectId && selectedTestCaseId) {
      loadFailedExecutionsForTestCase();
    }
  }, [open, selectedProjectId, selectedTestCaseId]);

  const loadAvailableSectionsAndEntities = async () => {
    try {
      setIsLoadingSections(true);
      const { sections } = await getProjectSectionsAndEntities(selectedProjectId);
      setAvailableSections(sections);
      setSection("");
      setEntity("");
      setSelectedTestCaseId("");
      setSelectedTestCase(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sections and entities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSections(false);
    }
  };

  const loadAvailableEntities = async () => {
    try {
      setIsLoadingEntities(true);
      const entities = await getProjectEntities(selectedProjectId, section);
      setAvailableEntities(entities);
      setEntity("");
      setSelectedTestCaseId("");
      setSelectedTestCase(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load entities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEntities(false);
    }
  };

  const loadAvailableTestCases = async () => {
    setIsLoadingTestCases(true);
    try {
      const testCases = await testSuiteService.getAvailableTestCases(selectedProjectId);
      const filteredTestCases = testCases.filter(tc => 
        tc.section === section && tc.entityName === entity
      );
      setAvailableTestCases(filteredTestCases);
      setSelectedTestCaseId("");
      setSelectedTestCase(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load test cases",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTestCases(false);
    }
  };

  const loadFailedExecutionsForTestCase = async () => {
    if (!selectedProjectId || !selectedTestCaseId) return;
    
    setIsLoadingFailedExecutions(true);
    try {
      const executions = await bugService.getFailedExecutionsByTestCaseId(selectedProjectId, selectedTestCaseId);
      setTestCaseFailedExecutions(Array.isArray(executions) ? executions : []);
      setSelectedExecutionId("");
      setSelectedExecution(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load failed executions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFailedExecutions(false);
    }
  };

  const handleTestCaseSelect = (testCaseId: string) => {
    const testCase = availableTestCases.find(tc => tc.testCaseId === testCaseId);
    if (testCase) {
      setSelectedTestCaseId((testCase as any)?.id || "");
      setSelectedTestCase(testCase);
    }
  };

  const handleExecutionSelect = (executionId: string) => {
    const execution = testCaseFailedExecutions.find(e => e.executionId === executionId);
    setSelectedExecutionId(executionId);
    setSelectedExecution(execution || null);
    
    if (execution) {
      setTitle(`Failed execution: ${execution.testCaseName}`);
      setDescription(`Test case ${execution.testCaseName} failed during execution`);
      setSection(execution.section);
      setEntity(execution.entityName);
      setErrorMessage(execution.errorMessage);
      setType(BugType.TEST_FAILURE);
    }
  };

  const handleNext = () => {
    const tabs = ["basic", "errors", "context"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const tabs = ["basic", "errors", "context"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bugData: CreateBugDto = {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        priority,
        environment,
        section: section || undefined,
        entity: entity || undefined,
        testCaseId: selectedTestCaseId || undefined,
        testCaseName: selectedTestCase?.name || undefined,
        errorMessage: errorMessage || undefined,
        errorType: errorType || undefined,
        errorCode: errorCode || undefined,
        errorStack: errorStack || undefined,
        executionId: selectedExecution?.executionId || undefined,
      };

      onCreateBug(bugData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bug",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setType(BugType.TEST_FAILURE);
    setSeverity(BugSeverity.MEDIUM);
    setPriority(BugPriority.MEDIUM);
    setEnvironment("default");
    setSection("");
    setEntity("");
    setSelectedTestCaseId("");
    setSelectedTestCase(null);
    setErrorMessage("");
    setErrorType("");
    setErrorCode("");
    setErrorStack("");
    setSelectedExecutionId("");
    setSelectedExecution(null);
    setActiveTab("basic");
    onOpenChange(false);
  };

  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Create Bug Report
          </DialogTitle>
          <DialogDescription>
            Create a new bug report with detailed information about the issue
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="errors">Error Details</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-4 min-h-0 max-h-[60vh]">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 min-h-full">
                <div className="space-y-4">
                  {/* Title, Environment, and Description row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter bug title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="environment">Environment</Label>
                        <Input
                          id="environment"
                          placeholder="e.g., development, staging, production"
                          value={environment}
                          onChange={(e) => setEnvironment(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the bug in detail"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Type, Severity, Priority row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={type} onValueChange={(value: BugType) => setType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BugType.SYSTEM_BUG}>System Bug</SelectItem>
                          <SelectItem value={BugType.FRAMEWORK_ERROR}>Framework Error</SelectItem>
                          <SelectItem value={BugType.TEST_FAILURE}>Test Failure</SelectItem>
                          <SelectItem value={BugType.ENVIRONMENT_ISSUE}>Environment Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity *</Label>
                      <Select value={severity} onValueChange={(value: BugSeverity) => setSeverity(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BugSeverity.LOW}>Low</SelectItem>
                          <SelectItem value={BugSeverity.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={BugSeverity.HIGH}>High</SelectItem>
                          <SelectItem value={BugSeverity.CRITICAL}>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={(value: BugPriority) => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BugPriority.LOW}>Low</SelectItem>
                          <SelectItem value={BugPriority.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={BugPriority.HIGH}>High</SelectItem>
                          <SelectItem value={BugPriority.CRITICAL}>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Error Details Tab */}
              <TabsContent value="errors" className="space-y-4 min-h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="errorMessage">Error Message</Label>
                      <Textarea
                        id="errorMessage"
                        placeholder="Enter the error message or description"
                        value={errorMessage}
                        onChange={(e) => setErrorMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="errorStack">Error Stack Trace</Label>
                      <Textarea
                        id="errorStack"
                        placeholder="Enter the full error stack trace"
                        value={errorStack}
                        onChange={(e) => setErrorStack(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="errorType">Error Type</Label>
                      <Input
                        id="errorType"
                        placeholder="e.g., HTTPError, TypeError, AssertionError"
                        value={errorType}
                        onChange={(e) => setErrorType(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="errorCode">Error Code</Label>
                      <Input
                        id="errorCode"
                        placeholder="e.g., 500, 404, 400"
                        value={errorCode}
                        onChange={(e) => setErrorCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Context Tab */}
              <TabsContent value="context" className="space-y-4 min-h-full">
                <div className="space-y-4">
                  {/* Project, Section, Entity Selection - Single row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="project">Project *</Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {getProjectName(project)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="section">Section *</Label>
                      <Select value={section} onValueChange={setSection} disabled={isLoadingSections}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingSections ? "Loading..." : "Select section"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSections.map((sectionName) => (
                            <SelectItem key={sectionName} value={sectionName}>
                              {sectionName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="entity">Entity *</Label>
                      <Select value={entity} onValueChange={setEntity} disabled={!section || isLoadingEntities}>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !section ? "Select section first" : 
                            isLoadingEntities ? "Loading entities..." : 
                            "Select entity"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEntities.map((entityName) => (
                            <SelectItem key={entityName} value={entityName}>
                              {entityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Test Cases and Failed Executions - Side by side */}
                  {section && entity && (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Test Cases Column */}
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="testCase">Test Cases *</Label>
                          <p className="text-sm text-muted-foreground">
                            Select a test case from {section} - {entity}
                          </p>
                        </div>

                        {isLoadingTestCases ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm">Loading test cases...</span>
                          </div>
                        ) : availableTestCases.length === 0 ? (
                          <div className="text-center p-4 border rounded-lg">
                            <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No test cases found for {section} - {entity}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableTestCases.map((testCase) => (
                              <Card
                                key={testCase.testCaseId}
                                className={`cursor-pointer transition-colors ${
                                  selectedTestCaseId === (testCase as any)?.id
                                    ? "ring-2 ring-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() => handleTestCaseSelect(testCase.testCaseId)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono text-xs text-muted-foreground mb-1">
                                        {testCase.testCaseId}
                                      </div>
                                      <h4 className="font-medium text-sm truncate">{testCase.name}</h4>
                                    </div>
                                    <Checkbox
                                      checked={selectedTestCaseId === (testCase as any)?.id}
                                      onChange={() => handleTestCaseSelect(testCase.testCaseId)}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Failed Executions Column */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-medium">Failed Executions</h3>
                          <p className="text-sm text-muted-foreground">
                            Select a failed execution to auto-fill bug details
                          </p>
                        </div>

                        {!selectedTestCaseId ? (
                          <div className="text-center p-4 border rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Please select a test case first
                            </p>
                          </div>
                        ) : isLoadingFailedExecutions ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm">Loading failed executions...</span>
                          </div>
                        ) : testCaseFailedExecutions.length === 0 ? (
                          <div className="text-center p-4 border rounded-lg">
                            <CheckCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No failed executions found for this test case
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(Array.isArray(testCaseFailedExecutions) ? testCaseFailedExecutions : []).map((execution) => (
                              <Card
                                key={execution.executionId}
                                className={`cursor-pointer transition-colors ${
                                  selectedExecutionId === execution.executionId
                                    ? "ring-2 ring-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() => handleExecutionSelect(execution.executionId)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono text-xs text-muted-foreground mb-1">
                                        {execution.executionId}
                                      </div>
                                      <h4 className="font-medium text-sm truncate">{execution.testCaseName}</h4>
                                      <p className="text-xs text-red-600 truncate mt-1">
                                        {execution.errorMessage}
                                      </p>
                                    </div>
                                    <Checkbox
                                      checked={selectedExecutionId === execution.executionId}
                                      onChange={() => handleExecutionSelect(execution.executionId)}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Test Case Info */}
                  {selectedTestCase && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Selected Test Case</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">ID:</span> {selectedTestCase.testCaseId}
                          </div>
                          <div>
                            <span className="font-medium">Name:</span> {selectedTestCase.name}
                          </div>
                          <div>
                            <span className="font-medium">Section:</span> {selectedTestCase.section}
                          </div>
                          <div>
                            <span className="font-medium">Entity:</span> {selectedTestCase.entityName}
                          </div>
                          {selectedTestCase.method && (
                            <div>
                              <span className="font-medium">Method:</span> {selectedTestCase.method}
                            </div>
                          )}
                          {selectedTestCase.testType && (
                            <div>
                              <span className="font-medium">Type:</span> {selectedTestCase.testType}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selected Execution Info */}
                  {selectedExecution && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Selected Execution</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Execution ID:</span> {selectedExecution.executionId}
                          </div>
                          <div>
                            <span className="font-medium">Test Case:</span> {selectedExecution.testCaseName}
                          </div>
                          <div>
                            <span className="font-medium">Entity:</span> {selectedExecution.entityName}
                          </div>
                          <div>
                            <span className="font-medium">Method:</span> {selectedExecution.method}
                          </div>
                          <div>
                            <span className="font-medium">Endpoint:</span> {selectedExecution.endpoint}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(selectedExecution.executionDate).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          
          {/* Basic Info Tab - Next button */}
          {activeTab === "basic" && (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
          
          {/* Error Details Tab - Back and Next buttons */}
          {activeTab === "errors" && (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </>
          )}
          
          {/* Context Tab - Create Bug button */}
          {activeTab === "context" && (
            <Button onClick={handleSubmit} disabled={isSubmitting || isCreating}>
              {isSubmitting || isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Bug"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
