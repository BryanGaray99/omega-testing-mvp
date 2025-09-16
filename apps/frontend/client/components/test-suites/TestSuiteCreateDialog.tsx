import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Loader2, 
  Layers,
  FileText
} from "lucide-react";
import { getProjectSectionsAndEntities, getProjectEntities } from "@/services/testCaseService";
import { testSuiteService } from "@/services/testSuiteService";

interface ProjectOption {
  id: string;
  name: string;
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

interface TestSuite {
  suiteId: string;
  name: string;
  type: string;
  totalTestCases: number;
}

interface TestSuiteCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectOption[];
  onCreateWithData: (data: any, projectId: string) => void;
}

export default function TestSuiteCreateDialog({
  open,
  onOpenChange,
  projects,
  onCreateWithData,
}: TestSuiteCreateDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || ""); // Default to first project
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<'test_set' | 'test_plan'>('test_set');
  const [section, setSection] = useState("");
  const [entity, setEntity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Content states
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [selectedTestSuites, setSelectedTestSuites] = useState<string[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [availableTestSuites, setAvailableTestSuites] = useState<TestSuite[]>([]);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);
  const [isLoadingTestSuites, setIsLoadingTestSuites] = useState(false);

  // Filter states
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');

  // Available sections and entities
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  // Update selected project when prop changes
  useEffect(() => {
    setSelectedProjectId(projects[0]?.id || ""); // Default to first project
  }, [projects]);

  // Load available sections and entities
  useEffect(() => {
    if (open && selectedProjectId) {
      loadAvailableSectionsAndEntities();
    }
  }, [open, selectedProjectId]);

  // Load test cases when section and entity change
  useEffect(() => {
    if (open && selectedProjectId && section && entity && type === 'test_set') {
      loadAvailableTestCases();
    }
  }, [open, selectedProjectId, section, entity, type]);

  // Load entities when section changes
  useEffect(() => {
    if (open && selectedProjectId && section) {
      loadAvailableEntities();
    }
  }, [open, selectedProjectId, section]);

  // Load test suites when type is test_plan and section is selected
  useEffect(() => {
    if (open && selectedProjectId && type === 'test_plan' && section) {
      loadAvailableTestSuites();
    }
  }, [open, selectedProjectId, type, section]);

  const loadAvailableSectionsAndEntities = async () => {
    try {
      setIsLoadingSections(true);
      const { sections } = await getProjectSectionsAndEntities(selectedProjectId);
      setAvailableSections(sections);
      setSection(""); // Reset section when project changes
      setEntity(""); // Reset entity when project changes
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
      setEntity(""); // Reset entity when section changes
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
      // Use the testSuiteService to get available test cases
      const testCases = await testSuiteService.getAvailableTestCases(selectedProjectId);
      // Filter by section and entity
      const filteredTestCases = testCases.filter(tc => 
        tc.section === section && tc.entityName === entity
      );
      setAvailableTestCases(filteredTestCases);
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

  const loadAvailableTestSuites = async () => {
    setIsLoadingTestSuites(true);
    try {
      // Use the testSuiteService to get test sets by section for test plans
      const testSuites = await testSuiteService.getTestSetsBySection(selectedProjectId, section);
      setAvailableTestSuites(testSuites);
    } catch (error: any) {
      // Handle 404 error gracefully - it means no test suites exist yet
      if (error.message && error.message.includes('404')) {
        setAvailableTestSuites([]);
        // Don't show error toast for 404 as it's expected when no test suites exist
      } else {
        toast({
          title: "Error",
          description: "Failed to load test suites",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingTestSuites(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleTestCase = (testCaseId: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId) 
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const handleToggleTestSuite = (suiteId: string) => {
    setSelectedTestSuites(prev => 
      prev.includes(suiteId) 
        ? prev.filter(id => id !== suiteId)
        : [...prev, suiteId]
    );
  };

  const handleSelectAllTestCases = () => {
    if (selectedTestCases.length === filteredTestCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(filteredTestCases.map(tc => tc.testCaseId));
    }
  };

  const handleSelectAllTestSuites = () => {
    if (selectedTestSuites.length === availableTestSuites.length) {
      setSelectedTestSuites([]);
    } else {
      setSelectedTestSuites(availableTestSuites.map(ts => ts.suiteId));
    }
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      toast({
        title: "Validation Error",
        description: "Project is required",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Test suite name is required",
        variant: "destructive",
      });
      return;
    }

    if (!section) {
      toast({
        title: "Validation Error",
        description: "Section is required",
        variant: "destructive",
      });
      return;
    }

    if (type === 'test_set' && !entity) {
      toast({
        title: "Validation Error",
        description: "Entity is required for Test Set",
        variant: "destructive",
      });
      return;
    }

    if (type === 'test_set' && selectedTestCases.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one test case for Test Set",
        variant: "destructive",
      });
      return;
    }

    if (type === 'test_plan' && selectedTestSuites.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one test suite for Test Plan",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const testSuiteData = {
        name: name.trim(),
        description: description.trim(),
        type,
        section: section.trim(),
        entity: type === 'test_set' ? entity.trim() : undefined,
        tags,
        testCaseIds: type === 'test_set' ? selectedTestCases : [],
        testSuiteIds: type === 'test_plan' ? selectedTestSuites : []
      };

      onCreateWithData(testSuiteData, selectedProjectId);
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test suite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProjectId(projects[0]?.id || ""); // Default to first project
    setName("");
    setDescription("");
    setType('test_set');
    setSection("");
    setEntity("");
    setTags([]);
    setTagInput("");
    setSelectedTestCases([]);
    setSelectedTestSuites([]);
    setActiveTab("basic");
    onOpenChange(false);
  };

  const getProjectName = (p: ProjectOption) => p.displayName || p.name || p.id;

  // Color functions for methods and test types
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

  // Extract unique methods and test types from available test cases
  const availableMethods = useMemo(() => {
    const unique = new Set<string>();
    availableTestCases.forEach(tc => tc.method && unique.add(tc.method));
    return Array.from(unique).sort();
  }, [availableTestCases]);

  const availableTestTypes = useMemo(() => {
    const unique = new Set<string>();
    availableTestCases.forEach(tc => tc.testType && unique.add(tc.testType));
    return Array.from(unique).sort();
  }, [availableTestCases]);

  // Filter test cases based on selected filters
  const filteredTestCases = availableTestCases.filter(testCase => {
    const methodMatch = methodFilter === 'all' || testCase.method === methodFilter;
    const typeMatch = testTypeFilter === 'all' || testCase.testType === testTypeFilter;
    return methodMatch && typeMatch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Create Test Suite
          </DialogTitle>
          <DialogDescription>
            Create a new test suite to organize and manage your test cases
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="content">Content Selection</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-4 min-h-0 max-h-[60vh]">
              <TabsContent value="basic" className="space-y-4 min-h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
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
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter test suite name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={type} onValueChange={(value: 'test_set' | 'test_plan') => setType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test_set">Test Set</SelectItem>
                          <SelectItem value="test_plan">Test Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the purpose of this test suite"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          placeholder="Add tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                setTags([...tags, tagInput.trim()]);
                                setTagInput('');
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                              setTagInput('');
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                              <button
                                type="button"
                                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section and Entity row - below the tabs */}
                <div className="grid grid-cols-2 gap-4">
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

                  {type === 'test_set' && (
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
                  )}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 min-h-full">
                {type === 'test_set' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Select Test Cases</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose test cases for {section} - {entity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={methodFilter} onValueChange={setMethodFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            {availableMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {availableTestTypes.map((testType) => (
                              <SelectItem key={testType} value={testType}>
                                {testType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!selectedProjectId ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Please select a project first.
                          </p>
                        </CardContent>
                      </Card>
                    ) : !section || !entity ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Please select Section and Entity in Basic Information to load available test cases.
                          </p>
                        </CardContent>
                      </Card>
                    ) : isLoadingTestCases ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Loading test cases...</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedTestCases.length === filteredTestCases.length && filteredTestCases.length > 0}
                                onCheckedChange={handleSelectAllTestCases}
                              />
                              <span className="font-medium">Select All</span>
                            </div>
                            <Badge variant="secondary">
                              {selectedTestCases.length} selected
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {filteredTestCases.map((testCase) => (
                              <div key={testCase.testCaseId} className="flex items-center space-x-3 p-2 rounded-md border hover:bg-muted/50">
                                <Checkbox
                                  checked={selectedTestCases.includes(testCase.testCaseId)}
                                  onCheckedChange={() => handleToggleTestCase(testCase.testCaseId)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{testCase.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {testCase.method && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(testCase.method)}`}>
                                        {testCase.method}
                                      </span>
                                    )}
                                    {testCase.testType && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(testCase.testType)}`}>
                                        {testCase.testType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {testCase.testCaseId}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Select Test Sets</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose test sets to include in this test plan
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedTestSuites.length} of {availableTestSuites.length} selected
                      </div>
                    </div>

                    {!selectedProjectId ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Please select a project first.
                          </p>
                        </CardContent>
                      </Card>
                    ) : isLoadingTestSuites ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Loading test suites...</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedTestSuites.length === availableTestSuites.length && availableTestSuites.length > 0}
                                onCheckedChange={handleSelectAllTestSuites}
                              />
                              <span className="font-medium">Select All</span>
                            </div>
                            <Badge variant="secondary">
                              {selectedTestSuites.length} selected
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {availableTestSuites.map((testSuite) => (
                              <div key={testSuite.suiteId} className="flex items-center space-x-3 p-2 rounded-md border hover:bg-muted/50">
                                <Checkbox
                                  checked={selectedTestSuites.includes(testSuite.suiteId)}
                                  onCheckedChange={() => handleToggleTestSuite(testSuite.suiteId)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{testSuite.name}</div>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {testSuite.suiteId}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Suite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
