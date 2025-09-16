import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bug, BugType, BugSeverity, BugPriority, BugStatus, UpdateBugDto } from '@/components/types/bug.types';
import { 
  Bug as BugIcon, 
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
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPriorityColor, getSeverityColor, getStatusColor } from '@/lib/colors';
import { normalizeTimeToSeconds } from '@/lib/utils';

interface BugDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bug: Bug | null;
  onUpdateBug: (bugId: string, bugData: UpdateBugDto) => void;
  isUpdating: boolean;
  onDelete: () => void;
  onClose: () => void;
}

export default function BugDetailsDialog({
  isOpen,
  onOpenChange,
  bug,
  onUpdateBug,
  isUpdating,
  onDelete,
  onClose,
}: BugDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateBugDto>>({});

  if (!bug) return null;

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
  };

  const handleInputChange = (field: keyof UpdateBugDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (bug) {
      onUpdateBug(bug.bugId, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleNavigateToTestCase = (testCaseId: string) => {
    // Abrir en nueva pestaña con la URL específica del test case y abrir automáticamente el diálogo
    const testCaseUrl = `${window.location.origin}/test-cases?testCaseId=${testCaseId}&openDetails=true&tab=scenario`;
    window.open(testCaseUrl, '_blank');
  };

  const handleNavigateToTestExecution = (executionId: string) => {
    // Abrir en nueva pestaña con la URL específica del test execution y abrir automáticamente el diálogo
    const executionUrl = `${window.location.origin}/test-executions?executionId=${executionId}&openDetails=true`;
    window.open(executionUrl, '_blank');
  };

  // Helper functions to get CSS classes for badges
  const getSeverityBadgeClass = (severity: BugSeverity) => {
    const colors = getSeverityColor(severity);
    return `${colors.bg} ${colors.text}`;
  };

  const getPriorityBadgeClass = (priority: BugPriority) => {
    const colors = getPriorityColor(priority);
    return `${colors.bg} ${colors.text}`;
  };

  const getStatusBadgeClass = (status: BugStatus) => {
    const colors = getStatusColor(status);
    return `${colors.bg} ${colors.text}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BugIcon className="h-5 w-5" />
                Bug Details
              </DialogTitle>
              <DialogDescription>
                Bug ID: {bug.bugId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="error-details">Error Details</TabsTrigger>
            <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Bug Details */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Bug Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bug ID</label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                        {bug.bugId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      {isEditing ? (
                        <Input
                          value={formData.title ?? bug.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{bug.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      {isEditing ? (
                        <Select
                          value={formData.type ?? bug.type}
                          onValueChange={(value) => handleInputChange("type", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BugType.SYSTEM_BUG}>System Bug</SelectItem>
                            <SelectItem value={BugType.FRAMEWORK_ERROR}>Framework Error</SelectItem>
                            <SelectItem value={BugType.TEST_FAILURE}>Test Failure</SelectItem>
                            <SelectItem value={BugType.ENVIRONMENT_ISSUE}>Environment Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{bug.type}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Environment</label>
                      {isEditing ? (
                        <Input
                          value={formData.environment ?? bug.environment ?? ""}
                          onChange={(e) => handleInputChange("environment", e.target.value)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{bug.environment || "default"}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      {isEditing ? (
                        <Select
                          value={formData.status ?? bug.status}
                          onValueChange={(value) => handleInputChange("status", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BugStatus.OPEN}>Open</SelectItem>
                            <SelectItem value={BugStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={BugStatus.RESOLVED}>Resolved</SelectItem>
                            <SelectItem value={BugStatus.CLOSED}>Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusBadgeClass(bug.status)}>
                            {bug.status.toUpperCase()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bug Configuration */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Bug Configuration</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Severity</label>
                    {isEditing ? (
                      <Select
                        value={formData.severity ?? bug.severity}
                        onValueChange={(value) => handleInputChange("severity", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BugSeverity.LOW}>Low</SelectItem>
                          <SelectItem value={BugSeverity.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={BugSeverity.HIGH}>High</SelectItem>
                          <SelectItem value={BugSeverity.CRITICAL}>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getSeverityBadgeClass(bug.severity)}>
                          {bug.severity.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    {isEditing ? (
                      <Select
                        value={formData.priority ?? bug.priority}
                        onValueChange={(value) => handleInputChange("priority", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BugPriority.LOW}>Low</SelectItem>
                          <SelectItem value={BugPriority.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={BugPriority.HIGH}>High</SelectItem>
                          <SelectItem value={BugPriority.CRITICAL}>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityBadgeClass(bug.priority)}>
                          {bug.priority.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description moved to right column */}
                {bug.description && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h4>
                    {isEditing ? (
                      <Textarea
                        value={formData.description ?? bug.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{bug.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Test Context</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      <p className="text-sm">{bug.section || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity</label>
                      <p className="text-sm">{bug.entity || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Method</label>
                      <p className="text-sm">{bug.method || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
                      <p className="text-sm">{bug.endpoint || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Test Case ID</label>
                      <p className="text-sm font-mono">
                        {bug.testCaseId ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="link"
                                  onClick={() => handleNavigateToTestCase(bug.testCaseId!)}
                                  className="underline p-0 h-auto"
                                >
                                  {bug.testCaseId}
                                  <ExternalLink className="h-3 w-3 ml-1 inline-block" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Test Case</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Test Case Name</label>
                    <p className="text-sm break-words">{bug.testCaseName || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Execution Context</h4>
                <div className="space-y-2">
                                       <div>
                       <label className="text-sm font-medium text-muted-foreground">Execution ID</label>
                       <p className="text-sm font-mono">
                         {bug.executionId ? (
                           <TooltipProvider>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   variant="link"
                                   onClick={() => handleNavigateToTestExecution(bug.executionId!)}
                                   className="underline p-0 h-auto"
                                 >
                                   {bug.executionId}
                                   <ExternalLink className="h-3 w-3 ml-1 inline-block" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>View Test Execution</p>
                               </TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                         ) : (
                           "N/A"
                         )}
                       </p>
                     </div>
                  {bug.executionDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Execution Date</label>
                      <p className="text-sm">{formatDate(bug.executionDate)}</p>
                    </div>
                  )}
                  {bug.executionTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Execution Time</label>
                      <p className="text-sm">{normalizeTimeToSeconds(bug.executionTime)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="error-details" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Error Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                    {isEditing ? (
                      <Textarea
                        value={formData.errorMessage ?? bug.errorMessage ?? ""}
                        onChange={(e) => handleInputChange("errorMessage", e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{bug.errorMessage || "N/A"}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Error Type</label>
                      {isEditing ? (
                        <Input
                          value={formData.errorType ?? bug.errorType ?? ""}
                          onChange={(e) => handleInputChange("errorType", e.target.value)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{bug.errorType || "N/A"}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Error Code</label>
                      {isEditing ? (
                        <Input
                          value={formData.errorCode ?? bug.errorCode ?? ""}
                          onChange={(e) => handleInputChange("errorCode", e.target.value)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{bug.errorCode || "N/A"}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Error Stack Trace</label>
                    {isEditing ? (
                      <Textarea
                        value={formData.errorStack ?? bug.errorStack ?? ""}
                        onChange={(e) => handleInputChange("errorStack", e.target.value)}
                        rows={4}
                        className="text-sm font-mono"
                      />
                    ) : (
                      <div className="text-sm font-mono bg-muted p-2 rounded max-h-40 overflow-y-auto">
                        {bug.errorStack || "N/A"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Request/Response Data</h4>
                <div className="space-y-3">
                  {bug.requestData && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Request Data</label>
                      <div className="text-sm font-mono bg-muted p-2 rounded max-h-40 overflow-y-auto">
                        {JSON.stringify(bug.requestData, null, 2)}
                      </div>
                    </div>
                  )}
                  {bug.responseData && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Response Data</label>
                      <div className="text-sm font-mono bg-muted p-2 rounded max-h-40 overflow-y-auto">
                        {JSON.stringify(bug.responseData, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timestamps" className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Timestamps</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reported At</label>
                  <p className="text-sm">{formatDate(bug.reportedAt)}</p>
                </div>
                {bug.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{formatDate(bug.updatedAt)}</p>
                  </div>
                )}
                {bug.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolved At</label>
                    <p className="text-sm">{formatDate(bug.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            {!isEditing ? (
              <Button variant="default" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Bug
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
