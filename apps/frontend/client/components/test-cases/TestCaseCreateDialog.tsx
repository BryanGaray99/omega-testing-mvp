import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ScenarioEditor from "./ScenarioEditor";
import { 
  Plus, 
  FileText, 
  Bot, 
  ListChecks, 
  Loader2, 
  ChevronDown, 
  Filter,
  Calendar,
  Hash,
  ArrowRight,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { suggestTestCases, createTestCase, getProjectSectionsAndEntities, getProjectEntities } from "@/services/testCaseService";

interface ProjectOption {
  id: string;
  name: string;
  path: string;
}

interface TestCaseCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectOption[];
  onCreateWithData: (data: any, projectId: string) => void;
}

interface Suggestion {
  id: string;
  entityName: string;
  section: string;
  requirements: string;
  suggestions: Array<{
    shortPrompt: string;
    shortDescription: string;
    detailedDescription: string;
  }>;
  createdAt: number;
  expiresAt: number;
}

export default function TestCaseCreateDialog({
  open,
  onOpenChange,
  projects,
  onCreateWithData,
}: TestCaseCreateDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("predef");
  const [subTab, setSubTab] = useState("basic");
  const [projectId, setProjectId] = useState("");
  const [section, setSection] = useState("");
  const [entityName, setEntityName] = useState("");
  const [method, setMethod] = useState("");
  const [testType, setTestType] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [scenarioTags, setScenarioTags] = useState<string[]>([]);
  const [aiRequirements, setAiRequirements] = useState("");
  const [suggestRequirements, setSuggestRequirements] = useState("");
  const [generatedScenario, setGeneratedScenario] = useState("");
  const [generatedSteps, setGeneratedSteps] = useState<string[]>([]);
  const [aiMeta, setAiMeta] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState<'idle' | 'processing' | 'analyzing' | 'generating' | 'complete'>('idle');
  const [activeGeneratedTab, setActiveGeneratedTab] = useState<'req' | 'gen'>('req');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'recent' | 'entity'>('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState("");
  const [isSuggestionsCollapsed, setIsSuggestionsCollapsed] = useState(true);
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [assistantName, setAssistantName] = useState("");
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<{ entityName: string; section: string; operation?: string; requirements: string; type?: 'generate' | 'suggest' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic data loading states
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  const suggestionsKey = `tc_suggestions_${projectId}`;

  // Load sections when project changes
  useEffect(() => {
    if (projectId) {
      setIsLoadingSections(true);
      getProjectSectionsAndEntities(projectId)
        .then(({ sections }) => {
          setAvailableSections(sections);
          setSection(""); // Reset section when project changes
          setEntityName(""); // Reset entity when project changes
        })
        .catch((error) => {
          console.error('Error loading sections:', error);
          toast({ 
            title: "Error", 
            description: "Failed to load project sections", 
            variant: "destructive" 
          });
          setAvailableSections([]);
        })
        .finally(() => {
          setIsLoadingSections(false);
        });
    } else {
      setAvailableSections([]);
      setSection("");
      setEntityName("");
    }
  }, [projectId, toast]);

  // Load entities when section changes
  useEffect(() => {
    if (projectId && section) {
      setIsLoadingEntities(true);
      getProjectEntities(projectId, section)
        .then((entities) => {
          setAvailableEntities(entities);
          setEntityName(""); // Reset entity when section changes
        })
        .catch((error) => {
          console.error('Error loading entities:', error);
          toast({ 
            title: "Error", 
            description: "Failed to load section entities", 
            variant: "destructive" 
          });
          setAvailableEntities([]);
        })
        .finally(() => {
          setIsLoadingEntities(false);
        });
    } else {
      setAvailableEntities([]);
      setEntityName("");
    }
  }, [projectId, section, toast]);

  const methodsForSelection = useMemo(() => {
    return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  }, []);

  const testTypesForSelection = useMemo(() => {
    return ['positive', 'negative'];
  }, []);

  // Load suggestions from localStorage
  useEffect(() => {
    if (projectId) {
      const stored = localStorage.getItem(suggestionsKey);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const items = data.items || [];
          const now = Date.now();
          const validItems = items.filter((item: Suggestion) => item.expiresAt > now);
          setSuggestions(validItems);
          if (validItems.length !== items.length) {
            localStorage.setItem(suggestionsKey, JSON.stringify({ items: validItems }));
          }
        } catch (e) {
          console.error('Error loading suggestions:', e);
        }
      }
    }
  }, [projectId, suggestionsKey]);

  // Reset all fields when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveTab('predef');
      setSubTab('basic');
      setProjectId('');
      setSection('');
      setEntityName('');
      setMethod('');
      setTestType('');
      setTags('');
      setDescription('');
      setScenarioText('');
      setScenarioTags([]);
      setAiRequirements('');
      setSuggestRequirements('');
      setGeneratedScenario('');
      setGeneratedSteps([]);
      setAiMeta(null);
      setGenerationProgress('idle');
      setActiveGeneratedTab('req');
      setIsGenerating(false);
      setIsSuggesting(false);
      setIsSubmitting(false);
    }
  }, [open, projects]);

  const getProjectName = (p?: ProjectOption) => p?.name || p?.id || "";

  const validatePredefined = (scenario: string, tags: string[]) => {
    if (!projectId) return "Project is required";
    if (!section) return "Section is required";
    if (!entityName) return "Entity is required";
    if (!method) return "Method is required";
    if (!testType) return "Test type is required";
    if (!description) return "Description is required";
    if (!scenario.trim()) return "Scenario is required";
    if (tags.length === 0) return "At least one tag is required";
    return null;
  };

  const handleSaveScenario = async (steps: any[], stepTags: string[], scenario: string) => {
    if (isSubmitting) return;
    const err = validatePredefined(scenario, stepTags);
    if (err) {
      toast({ title: "Validation error", description: err, variant: "destructive" });
      setScenarioText(scenario);
      setScenarioTags(stepTags);
      return;
    }

    try {
      setIsSubmitting(true);
      setScenarioText(scenario);
      setScenarioTags(stepTags);
      const testCaseData = {
        projectId,
        section,
        entityName,
        method,
        testType,
        description,
        scenario,
        tags: stepTags,
      };
      
      await createTestCase(testCaseData);
      toast({ title: "Success", description: "Test case created successfully" });
      onCreateWithData(testCaseData, projectId);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to create test case", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggest = async () => {
    if (!projectId || !entityName || !section || !suggestRequirements) {
      toast({ title: "Validation error", description: "Project, Section, Entity and Requirements are required", variant: "destructive" });
      return;
    }

    const hasAssistant = await ensureAssistant('suggest');
    if (!hasAssistant) {
      return; // The ensureAssistant function will handle the modal and pending generation
    }

    setIsSuggesting(true);
    await proceedSuggestion({ entityName, section, requirements: suggestRequirements });
    setIsSuggesting(false);
  };

  const proceedSuggestion = async (payload: { entityName: string; section: string; requirements: string }) => {
    try {
      const res = await suggestTestCases(projectId, payload);
      const ttl = 7 * 24 * 60 * 60 * 1000;
      const item: Suggestion = {
        id: Date.now().toString(),
        entityName: payload.entityName,
        section: payload.section,
        requirements: payload.requirements,
        suggestions: res.suggestions || [],
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      const next = [...suggestions, item];
      setSuggestions(next);
      localStorage.setItem(suggestionsKey, JSON.stringify({ items: next }));
      toast({ title: "Suggestions generated", description: `${res.totalSuggestions} AI suggestions added to local cache` });
    } catch (e:any) {
      toast({ title: "Error", description: e?.message || "Failed to generate suggestions", variant: "destructive" });
    }
  };

  const ensureAssistant = async (operationType: 'generate' | 'suggest'): Promise<boolean> => {
    const coreBase = import.meta.env.VITE_CORE_AGENT_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
    try {
      const res = await fetch(`${coreBase}/projects/${projectId}/ai/assistant`, { method: 'GET' });
      if (res.ok) return true;
      if (res.status === 400) {
        // Set pending generation based on operation type
        if (operationType === 'generate') {
          setPendingGeneration({ entityName, section, operation: "add-scenario", requirements: aiRequirements, type: 'generate' });
        } else {
          setPendingGeneration({ entityName, section, requirements: suggestRequirements, type: 'suggest' });
        }
        
        return new Promise((resolve) => {
          setIsAssistantDialogOpen(true);
          toast({ title: 'Assistant not found', description: 'Create an assistant to enable AI generation.' });
          
          // Store the resolve function to call it when assistant is created
          (window as any).__assistantCreationResolve = resolve;
        });
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.message || 'Failed to check assistant');
    } catch (e:any) {
      toast({ title: 'Error', description: e?.message || 'Failed to check assistant', variant: 'destructive' });
      return false;
    }
  };

  const handleGenerateWithAI = async () => {
    if (!projectId || !entityName || !section || !aiRequirements) {
      toast({ title: "Validation error", description: "Project, Section, Entity and Requirements are required", variant: "destructive" });
      return;
    }

    const hasAssistant = await ensureAssistant('generate');
    if (!hasAssistant) {
      return; // The ensureAssistant function will handle the modal and pending generation
    }

    setIsGenerating(true);
    await proceedGeneration({ entityName, section, operation: "add-scenario", requirements: aiRequirements });
    setIsGenerating(false);
  };

  const proceedGeneration = async (payload: { entityName: string; section: string; operation?: string; requirements: string }) => {
    setGeneratedScenario("");
    setGeneratedSteps([]);
    setAiMeta(null);
    setGenerationProgress('processing');
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
      setGenerationProgress('analyzing');
      const res = await fetch(`${base}/projects/${projectId}/test-cases/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, operation: payload.operation || "add-scenario" }),
      });
      setGenerationProgress('generating');
      if (res.ok) {
        const json = await res.json();
        const newCode = json?.data?.newCode || json?.data?.data?.newCode || {};
        const scenario = newCode?.feature || '';
        const steps = newCode?.steps || '';
        const meta = json?.data?.metadata || json?.metadata || null;
        setGeneratedScenario(scenario);
        setScenarioText(scenario);
        setGeneratedSteps(steps);
        setAiMeta(meta);
        setGenerationProgress('complete');
        setActiveGeneratedTab('gen');
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || err?.message || 'AI generation failed');
      }
    } catch (e:any) {
      toast({ title: 'Error', description: e?.message || 'AI generation failed', variant: 'destructive' });
      setGenerationProgress('idle');
    }
  };

  const resetAIForm = () => {
          setAiRequirements("");
      setSuggestRequirements("");
      setGeneratedScenario("");
      setGeneratedSteps([]);
      setAiMeta(null);
    setGenerationProgress('idle');
    setActiveGeneratedTab('req');
  };

  const removeSuggestion = (id: string) => {
    const next = suggestions.filter((s) => s.id !== id);
    setSuggestions(next);
    localStorage.setItem(suggestionsKey, JSON.stringify({ items: next }));
  };

  const useSuggestionInAI = (suggestion: Suggestion) => {
    setActiveTab('ai');
    setEntityName(suggestion.entityName);
    setSection(suggestion.section);
    setAiRequirements(suggestion.requirements);
  };

  const useSuggestionPrompt = (suggestion: Suggestion, prompt: string) => {
    setActiveTab('ai');
    setEntityName(suggestion.entityName);
    setSection(suggestion.section);
    setAiRequirements(prompt);
  };

  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions;
    
    if (suggestionFilter === 'recent') {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => s.createdAt > oneWeekAgo);
    } else if (suggestionFilter === 'entity' && selectedEntityFilter) {
      filtered = filtered.filter(s => s.entityName === selectedEntityFilter);
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [suggestions, suggestionFilter, selectedEntityFilter]);

  const uniqueEntities = useMemo(() => {
    const entities = new Set(suggestions.map(s => s.entityName));
    return Array.from(entities).sort();
  }, [suggestions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Test Case</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predef">Predefined</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="suggest">Suggested</TabsTrigger>
          </TabsList>

          {/* Predefined */}
          <TabsContent value="predef" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Create case with existing steps</h4>
              <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="scenario">Scenario</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project</label>
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem value={p.id} key={p.id}>{getProjectName(p)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      <Select value={section} onValueChange={setSection} disabled={isLoadingSections}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingSections ? "Loading sections..." : "Select section"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSections.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableSections.length === 0 && !isLoadingSections && (
                        <p className="text-xs text-muted-foreground mt-1">No sections available for this project</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity</label>
                      <Select value={entityName} onValueChange={setEntityName} disabled={!section || isLoadingEntities}>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !section ? "Select section first" : 
                            isLoadingEntities ? "Loading entities..." : 
                            "Select entity"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEntities.map((e) => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!section && (
                        <p className="text-xs text-muted-foreground mt-1">Select a section first</p>
                      )}
                      {section && availableEntities.length === 0 && !isLoadingEntities && (
                        <p className="text-xs text-muted-foreground mt-1">No entities available for this section</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Method</label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {methodsForSelection.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Test Type</label>
                      <Select value={testType} onValueChange={setTestType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          {testTypesForSelection.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Test case description" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scenario" className="space-y-3">
                  <ScenarioEditor
                    testCase={{
                      testCaseId: "NEW",
                      testCaseIdName: "NEW",
                      name: "New Test Case",
                      entityName,
                      section,
                      method,
                      testType,
                      scenario: scenarioText || "",
                      status: "draft",
                      projectId: projectId || "",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: scenarioTags,
                      hooks: {},
                      examples: {},
                      metadata: {},
                      lastRun: undefined,
                      lastRunStatus: undefined,
                    } as any}
                    projectId={projectId}
                    onSave={(steps, tags, scenario) => {
                      setScenarioText(scenario);
                      setScenarioTags(tags);
                      return handleSaveScenario(steps, tags, scenario);
                    }}
                    onCancel={() => onOpenChange(false)}
                    onChange={(steps, tags, scenario) => {
                      setScenarioText(scenario);
                      setScenarioTags(tags);
                    }}
                    isPending={isSubmitting}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* AI */}
          <TabsContent value="ai" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Create scenarios and new steps with AI</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem value={p.id} key={p.id}>{getProjectName(p)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  <Select value={section} onValueChange={setSection} disabled={isLoadingSections}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingSections ? "Loading sections..." : "Select section"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableSections.length === 0 && !isLoadingSections && (
                    <p className="text-xs text-muted-foreground mt-1">No sections available for this project</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entity</label>
                  <Select value={entityName} onValueChange={setEntityName} disabled={!section || isLoadingEntities}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !section ? "Select section first" : 
                        isLoadingEntities ? "Loading entities..." : 
                        "Select entity"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!section && (
                    <p className="text-xs text-muted-foreground mt-1">Select a section first</p>
                  )}
                  {section && availableEntities.length === 0 && !isLoadingEntities && (
                    <p className="text-xs text-muted-foreground mt-1">No entities available for this section</p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                <Textarea rows={3} value={aiRequirements} onChange={(e) => setAiRequirements(e.target.value)} placeholder="Describe what you want to test..." />
              </div>
              <div className="mt-3 flex justify-end">
                <Button 
                  disabled={isGenerating} 
                  className={`${isGenerating ? 'animate-pulse' : ''}`}
                  onClick={handleGenerateWithAI}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <Tabs value={activeGeneratedTab} onValueChange={(v) => setActiveGeneratedTab(v as 'req' | 'gen')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="req">Requirements</TabsTrigger>
                  <TabsTrigger value="gen">Generated</TabsTrigger>
                </TabsList>

                <TabsContent value="req" className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Enter your requirements above and click "Generate with AI" to create test scenarios.
                  </div>
                </TabsContent>

                <TabsContent value="gen" className="space-y-3">
                  {generationProgress === 'idle' ? (
                    <div className="text-sm text-muted-foreground">No content generated yet</div>
                  ) : generationProgress === 'processing' || generationProgress === 'analyzing' || generationProgress === 'generating' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">
                          {generationProgress === 'processing' && 'Processing request...'}
                          {generationProgress === 'analyzing' && 'Analyzing existing files...'}
                          {generationProgress === 'generating' && 'Generating with AI...'}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{
                          width: generationProgress === 'processing' ? '25%' : 
                                 generationProgress === 'analyzing' ? '60%' : '90%'
                        }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {generatedScenario && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Generated Scenario</div>
                          <pre className="p-3 text-xs bg-muted rounded overflow-auto whitespace-pre-wrap">
                            {generatedScenario}
                          </pre>
                        </div>
                      )}
                      {generatedSteps && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Steps</div>
                          <pre className="p-3 text-xs bg-muted rounded overflow-auto whitespace-pre-wrap">
                            {typeof generatedSteps === 'string' ? generatedSteps : 'No steps generated'}
                          </pre>
                        </div>
                      )}
                      {aiMeta && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {aiMeta?.modelUsed && <span className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">{aiMeta.modelUsed}</span>}
                          {typeof aiMeta?.tokensUsed !== 'undefined' && <span className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">tokens: {aiMeta.tokensUsed}</span>}
                          {typeof aiMeta?.processingTime !== 'undefined' && <span className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">time: {aiMeta.processingTime}ms</span>}
                          {aiMeta?.generationId && <span className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">id: {aiMeta.generationId}</span>}
                        </div>
                      )}
                      {generatedScenario && (
                        <div className="flex justify-end pt-2 border-t">
                          <Button variant="outline" size="sm" onClick={resetAIForm}>
                            Generate Another
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Suggested */}
          <TabsContent value="suggest" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Suggest test cases</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem value={p.id} key={p.id}>{getProjectName(p)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  <Select value={section} onValueChange={setSection} disabled={isLoadingSections}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingSections ? "Loading sections..." : "Select section"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableSections.length === 0 && !isLoadingSections && (
                    <p className="text-xs text-muted-foreground mt-1">No sections available for this project</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entity</label>
                  <Select value={entityName} onValueChange={setEntityName} disabled={!section || isLoadingEntities}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !section ? "Select section first" : 
                        isLoadingEntities ? "Loading entities..." : 
                        "Select entity"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!section && (
                    <p className="text-xs text-muted-foreground mt-1">Select a section first</p>
                  )}
                  {section && availableEntities.length === 0 && !isLoadingEntities && (
                    <p className="text-xs text-muted-foreground mt-1">No entities available for this section</p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                <Textarea rows={3} value={suggestRequirements} onChange={(e) => setSuggestRequirements(e.target.value)} placeholder="Describe what kind of test cases you want suggestions for..." />
              </div>
              <div className="mt-3 flex justify-end">
                <Button 
                  onClick={handleSuggest} 
                  disabled={isSuggesting}
                  className={`${isSuggesting ? 'animate-pulse' : ''}`}>
                  {isSuggesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ListChecks className="h-4 w-4 mr-2" />
                  )}
                  {isSuggesting ? 'Generating...' : 'Generate Suggestions'}
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div 
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => setIsSuggestionsCollapsed(!isSuggestionsCollapsed)}
              >
                <h4 className="font-medium">Saved suggestions</h4>
                <div className="flex items-center gap-2">
                  {suggestions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={suggestionFilter} onValueChange={(v) => setSuggestionFilter(v as 'all' | 'recent' | 'entity')}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="entity">By Entity</SelectItem>
                        </SelectContent>
                      </Select>
                      {suggestionFilter === 'entity' && (
                        <Select value={selectedEntityFilter} onValueChange={setSelectedEntityFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Entity" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueEntities.map((entity) => (
                              <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">{filteredSuggestions.length} suggestions</span>
                    {isSuggestionsCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {!isSuggestionsCollapsed && (
                <>
                  {suggestions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No suggestions yet</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSuggestions.map((s) => (
                        <Card key={s.id} className="border">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{s.entityName}</Badge>
                                <Badge variant="secondary">{s.section}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(s.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeSuggestion(s.id)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{s.requirements}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {s.suggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{suggestion.shortPrompt}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {suggestion.detailedDescription && suggestion.detailedDescription.length > 100 
                                        ? `${suggestion.detailedDescription.substring(0, 100)}...`
                                        : suggestion.detailedDescription
                                      }
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => useSuggestionPrompt(s, `Test Case: ${suggestion.shortPrompt}\nDetails: ${suggestion.detailedDescription}`)}>
                                    <Bot className="h-4 w-4 mr-1" />
                                    Gen AI
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Assistant creation dialog */}
        <Dialog open={isAssistantDialogOpen} onOpenChange={setIsAssistantDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Create Assistant</DialogTitle>
              <DialogDescription>
                An assistant is required to generate scenarios. Provide a name to create it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Assistant name</label>
              <Input value={assistantName} onChange={(e) => setAssistantName(e.target.value)} placeholder="My Testing Assistant" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssistantDialogOpen(false)}>Cancel</Button>
              <Button disabled={!assistantName || isCreatingAssistant} onClick={async () => {
                const coreBase = import.meta.env.VITE_CORE_AGENT_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
                try {
                  setIsCreatingAssistant(true);
                  const res = await fetch(`${coreBase}/projects/${projectId}/ai/assistant/init`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: assistantName })
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error?.message || err?.message || 'Failed to create assistant');
                  }
                  toast({ title: 'Assistant created', description: 'You can now generate scenarios with AI.' });
                  setIsAssistantDialogOpen(false);
                  
                  // Resolve the promise to continue with the original operation
                  if ((window as any).__assistantCreationResolve) {
                    (window as any).__assistantCreationResolve(true);
                    (window as any).__assistantCreationResolve = null;
                  }
                  
                  if (pendingGeneration) {
                    if (pendingGeneration.type === 'suggest') {
                      setIsSuggesting(true);
                      // Extract only valid properties for suggestion
                      const { entityName, section, requirements } = pendingGeneration;
                      await proceedSuggestion({ entityName, section, requirements });
                      setIsSuggesting(false);
                    } else {
                      setIsGenerating(true);
                      // Extract only valid properties for generation
                      const { entityName, section, operation, requirements } = pendingGeneration;
                      await proceedGeneration({ entityName, section, operation, requirements });
                      setIsGenerating(false);
                    }
                  }
                } catch (e:any) {
                  toast({ title: 'Error', description: e?.message || 'Failed to create assistant', variant: 'destructive' });
                } finally {
                  setIsCreatingAssistant(false);
                }
              }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {(activeTab !== 'predef' || subTab !== 'scenario') && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 