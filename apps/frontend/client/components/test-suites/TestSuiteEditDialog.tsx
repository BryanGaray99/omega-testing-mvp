import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Loader2, 
  Layers,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { testSuiteService } from "@/services/testSuiteService";
import { TestSuite } from "@/services/testSuiteService";
import { getMethodColor as getMethodColorClass } from "@/lib/colors";
import { useTranslation } from "@/contexts/LanguageContext";
import { replaceParams } from "@/lib/translations";

interface TestCase {
  testCaseId: string;
  name: string;
  entityName: string;
  section: string;
  method?: string;
  testType?: string;
  status?: string;
}

interface TestSuiteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSuite: TestSuite | null;
  onSave: (testSuiteId: string, testCaseIds: string[]) => void;
}

export default function TestSuiteEditDialog({
  open,
  onOpenChange,
  testSuite,
  onSave,
}: TestSuiteEditDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');

  // Load available test cases when dialog opens
  useEffect(() => {
    if (open && testSuite) {
      loadAvailableTestCases();
      // Set currently selected test cases
      const currentTestCaseIds = testSuite.testCases?.map(tc => tc.testCaseId) || [];
      setSelectedTestCases(currentTestCaseIds);
    }
  }, [open, testSuite]);

  const loadAvailableTestCases = async () => {
    if (!testSuite) return;
    
    try {
      setIsLoadingTestCases(true);
      const testCases = await testSuiteService.getAvailableTestCases(testSuite.projectId);
      // Filter by section and entity
      const filteredTestCases = testCases.filter(tc => 
        tc.section === testSuite.section && tc.entityName === testSuite.entity
      );
      setAvailableTestCases(filteredTestCases);
    } catch (error: any) {
      if (error.status === 404) {
        // No test cases available, set empty array
        setAvailableTestCases([]);
      } else {
        toast({
          title: t("common.error"),
          description: t("suiteEdit.toastFailedLoad"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingTestCases(false);
    }
  };

  const handleToggleTestCase = (testCaseId: string) => {
    setSelectedTestCases(prev => {
      if (prev.includes(testCaseId)) {
        return prev.filter(id => id !== testCaseId);
      } else {
        return [...prev, testCaseId];
      }
    });
  };

  const handleSelectAllTestCases = (checked: boolean) => {
    if (checked) {
      const allIds = filteredTestCases.map(tc => tc.testCaseId);
      setSelectedTestCases(allIds);
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleSubmit = async () => {
    if (!testSuite) return;
    
    try {
      setIsSubmitting(true);
      await onSave(testSuite.suiteId, selectedTestCases);
      toast({
        title: t("common.success"),
        description: t("suiteEdit.toastSuccess"),
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("suiteEdit.toastFailedUpdate"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTestCases([]);
    setMethodFilter('all');
    setTestTypeFilter('all');
    onOpenChange(false);
  };

  // Color functions for methods and test types - use centralized colors
  const getMethodColor = (method: string) => getMethodColorClass(method);
  const getTestTypeColor = (testType: string) => {
    switch (testType) {
      case "positive":
        return "bg-green-100 dark:bg-[#064E3B] text-green-800 dark:text-[#34D399]";
      case "negative":
        return "bg-red-100 dark:bg-[#3F1D1D] text-red-800 dark:text-[#F87171]";
      default:
        return "bg-gray-100 dark:bg-[#1F2937] text-gray-800 dark:text-[#9CA3AF]";
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

  if (!testSuite) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {replaceParams(t("suiteEdit.title"), { name: testSuite.name })}
          </DialogTitle>
          <DialogDescription>
            {replaceParams(t("suiteEdit.description"), { section: testSuite.section, entity: testSuite.entity })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-4 min-h-0 max-h-[60vh]">
            <div className="space-y-4">
              {/* Test Suite Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t("suiteEdit.suiteInformation")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("suiteEdit.typeLabel")}</span>
                      <Badge className="ml-2">
                        {testSuite.type === 'test_set' ? t("suiteEdit.typeTestSet") : t("suiteEdit.typeTestPlan")}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("suiteEdit.statusLabel")}</span>
                      <Badge variant="outline" className="ml-2">
                        {testSuite.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("suiteEdit.sectionLabel")}</span>
                      <span className="ml-2 font-medium">{testSuite.section}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("suiteEdit.entityLabel")}</span>
                      <span className="ml-2 font-medium">{testSuite.entity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Cases Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{t("suiteEdit.manageTestCases")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {replaceParams(t("suiteEdit.selectTestCasesFor"), { section: testSuite.section, entity: testSuite.entity })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="w-32">
<SelectValue placeholder={t("suiteCreate.methodPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("suiteCreate.allMethods")}</SelectItem>
                        {availableMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                      <SelectTrigger className="w-32">
<SelectValue placeholder={t("suiteCreate.typePlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("suiteCreate.allTypes")}</SelectItem>
                        {availableTestTypes.map((testType) => (
                          <SelectItem key={testType} value={testType}>
                            {testType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoadingTestCases ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">{t("suiteCreate.loadingTestCases")}</p>
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
                          <span className="font-medium">{t("suiteCreate.selectAll")}</span>
                        </div>
                        <Badge variant="secondary">
                          {replaceParams(t("suiteCreate.ofSelected"), { selected: String(selectedTestCases.length), total: String(filteredTestCases.length) })}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {filteredTestCases.length > 0 ? (
                          filteredTestCases.map((testCase) => (
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
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {t("suiteEdit.noTestCasesAvailable")}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("suiteEdit.updating")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("suiteEdit.updateButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
