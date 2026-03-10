import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExecution } from "@/contexts/ExecutionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Copy,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { TestCase } from "@/components/types/testCase.types";
import { useTranslation } from "@/contexts/LanguageContext";

interface TestCaseCardProps {
  testCase: TestCase;
  projects: any[];
  onViewDetails: (testCase: TestCase) => void;
  onEdit: (testCase: TestCase) => void;
  onRun: (testCase: TestCase) => Promise<any>;
  onDelete: (testCase: TestCase) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export default function TestCaseCard({
  testCase,
  projects,
  onViewDetails,
  onEdit,
  onRun,
  onDelete,
  openDropdownId,
  setOpenDropdownId,
}: TestCaseCardProps) {
  const { t } = useTranslation();
  const { isExecuting, showExecuted, getSuiteExecutionId } = useExecution();
  
  // Obtener el executionId real para este test case, o usar el testCaseId como fallback
  // Usar la clave específica con testCaseId para mapeo preciso
  const testCaseKey = `${testCase.entityName}-${testCase.testCaseId}`;
  const realExecutionId = getSuiteExecutionId(testCaseKey);
  const executionId = realExecutionId || `testcase-${testCase.testCaseId}`;
  

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

  const getExecutionStatusColor = (lastRunStatus?: string, lastRun?: string) => {
    if (!lastRun) {
      return "secondary";
    }
    
    switch (lastRunStatus) {
      case "passed":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getExecutionStatusText = (lastRunStatus?: string, lastRun?: string) => {
    if (!lastRun) {
      return t("testCases.statusPendingBadge");
    }
    switch (lastRunStatus) {
      case "passed":
        return t("testCases.statusPassedBadge");
      case "failed":
        return t("testCases.statusFailedBadge");
      default:
        return t("testCases.statusUnknownBadge");
    }
  };

  const handleRun = async () => {
    if (isExecuting(executionId)) return;
    
    try {
      await onRun(testCase);
    } catch (error) {
      console.error('Error running test case:', error);
    }
  };

  const handleNavigateToExecution = () => {
    if (realExecutionId) {
      const executionUrl = `${window.location.origin}/test-executions?executionId=${realExecutionId}&openDetails=true`;
      window.open(executionUrl, '_blank');
    }
  };

  return (
         <Card className="relative flex flex-col h-full">
       <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getExecutionStatusIcon(testCase.lastRunStatus, testCase.lastRun)}
            <Badge variant={getExecutionStatusColor(testCase.lastRunStatus, testCase.lastRun) as any}>
              {getExecutionStatusText(testCase.lastRunStatus, testCase.lastRun)}
            </Badge>
            {testCase.lastRun && (
              <span className="text-xs text-muted-foreground">
                {new Date(testCase.lastRun).toLocaleDateString()}
              </span>
            )}
          </div>
          <DropdownMenu
            open={openDropdownId === testCase.testCaseId}
            onOpenChange={(open) => setOpenDropdownId(open ? testCase.testCaseId : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:text-foreground" aria-label={t("testCases.actions") || "Open actions menu"}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("testCases.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(testCase)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("testCases.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(testCase)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("testCases.editTestCase")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-white [&_svg]:text-[#F87171]"
                onClick={() => onDelete(testCase)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("testCases.deleteTestCase")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
                 <div className="text-xs text-muted-foreground mb-1">{testCase.testCaseId}</div>
         <CardTitle className="text-lg">{testCase.name}</CardTitle>
         <div className="flex flex-wrap gap-2 mt-2">
           <span
             className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(testCase.method)}`}
           >
             {testCase.method}
           </span>
           <span
             className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(testCase.testType)}`}
           >
             {testCase.testType}
           </span>
         </div>
      </CardHeader>
             <CardContent className="flex-1 flex flex-col">
         <div className="space-y-3 flex-1">
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">{t("testCases.projectLabel")}</span>
               <span className="font-medium">
                 {projects.find(p => p.id === testCase.projectId)?.name || testCase.projectId}
               </span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">{t("testCases.sectionLabel")}</span>
               <span className="font-medium">{testCase.section}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">{t("testCases.entityLabel")}</span>
               <span className="font-medium">{testCase.entityName}</span>
             </div>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">{t("testCases.tagsLabel")}</span>
             <div className="flex flex-wrap gap-1">
               {testCase.tags.map((tag) => (
                 <Badge key={tag} variant="secondary" className="text-xs">
                   {tag}
                 </Badge>
               ))}
             </div>
           </div>
                 </div>
        
        <div className="h-6"></div>
        <div className="pt-3 border-t mt-auto">
           <div className="relative">
             {isExecuting(executionId) && (
               <div className="absolute inset-0 bg-green-100 dark:bg-[#052E26] rounded-md overflow-hidden pointer-events-none">
                 <div 
                   className="h-full w-full"
                   style={{
                     background: `repeating-linear-gradient(
                       45deg,
                       transparent,
                       transparent 10px,
                       rgba(34, 197, 94, 0.3) 10px,
                       rgba(34, 197, 94, 0.3) 20px
                     )`,
                     animation: 'moveStripes 3s linear infinite'
                   }}
                 />
                 <style>{`
                   @keyframes moveStripes {
                     0% { transform: translateX(-100%); }
                     100% { transform: translateX(100%); }
                   }
                 `}</style>
               </div>
             )}
             {showExecuted(executionId) && realExecutionId ? (
               <Button
                 className="w-full relative z-10"
                 variant="default"
                 size="sm"
                 onClick={handleNavigateToExecution}
               >
                 <ExternalLink className="h-4 w-4 mr-2" />
                 {t("testCases.viewExecution")}
               </Button>
             ) : (
               <Button
                 className="w-full relative z-10"
                 variant="success"
                 size="sm"
                 onClick={handleRun}
                 disabled={isExecuting(executionId)}
               >
                 <Play className="h-4 w-4 mr-2" />
                 {isExecuting(executionId) ? t("testCases.executing") : t("testCases.runTest")}
               </Button>
             )}
           </div>
         </div>
       </CardContent>
    </Card>
  );
} 