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
  Trash,
  Play,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { TestSuite } from "@/services/testSuiteService";

interface TestSuiteCardProps {
  testSuite: TestSuite;
  projects: any[];
  onViewDetails: (testSuite: TestSuite) => void;
  onEdit: (testSuite: TestSuite) => void;
  onRun: (testSuite: TestSuite) => Promise<any>;
  onDelete: (testSuite: TestSuite) => void;
  onNavigateToTestExecution?: (executionId: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export default function TestSuiteCard({
  testSuite,
  projects,
  onViewDetails,
  onEdit,
  onRun,
  onDelete,
  onNavigateToTestExecution,
  openDropdownId,
  setOpenDropdownId,
}: TestSuiteCardProps) {
  const { isExecuting, showExecuted, getSuiteExecutionId } = useExecution();
  
  // Obtener el executionId real para este test suite, o usar el suiteId como fallback
  // Usar la misma clave que en executeMutation: entity-name
  const testSuiteKey = `${testSuite.entity}-${testSuite.name}`;
  const realExecutionId = getSuiteExecutionId(testSuiteKey);
  const executionId = realExecutionId || `testsuite-${testSuite.suiteId}`;
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "test_set":
        return <Layers className="h-5 w-5" />;
      case "test_plan":
        return <Layers className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

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

  const handleExecute = async () => {
    if (isExecuting(executionId)) return;
    
    try {
      await onRun(testSuite);
    } catch (error) {
      console.error('Error executing test suite:', error);
    }
  };

  const handleNavigateToExecution = () => {
    if (realExecutionId && onNavigateToTestExecution) {
      onNavigateToTestExecution(realExecutionId);
    }
  };

  return (
    <Card className="relative flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getExecutionStatusIcon(testSuite.status)}
            <Badge className={getStatusColor(testSuite.status)}>
              {testSuite.status.toUpperCase()}
            </Badge>
            {testSuite.lastExecutedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(testSuite.lastExecutedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <DropdownMenu
            open={openDropdownId === testSuite.suiteId}
            onOpenChange={(open) => setOpenDropdownId(open ? testSuite.suiteId : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(testSuite)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(testSuite)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Test Suite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(testSuite)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Test Suite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-muted-foreground mb-1">{testSuite.suiteId}</div>
        <CardTitle className="text-lg">{testSuite.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {testSuite.type === 'test_set' ? 'Test Set' : 'Test Plan'}
          </span>
          {testSuite.section && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {testSuite.section}
              {testSuite.entity && ` • ${testSuite.entity}`}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">
                {projects.find(p => p.id === testSuite.projectId)?.name || testSuite.projectId}
              </span>
            </div>
            {testSuite.section && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Section:</span>
                <span className="font-medium">{testSuite.section}</span>
              </div>
            )}
            {testSuite.entity && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entity:</span>
                <span className="font-medium">{testSuite.entity}</span>
              </div>
            )}
          </div>
          
          {testSuite.type === 'test_plan' && testSuite.testSets && testSuite.testSets.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Test Sets:</span>
                <span className="font-medium">{testSuite.testSets.length}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">
                {testSuite.type === 'test_plan' ? 'Total Cases:' : 'Test Cases:'}
              </span>
              <span className="ml-1 font-medium">{testSuite.totalTestCases}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Passed:</span>
              <span className="ml-1 font-medium text-green-600">{testSuite.passedTestCases}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Failed:</span>
              <span className="ml-1 font-medium text-red-600">{testSuite.failedTestCases}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Skipped:</span>
              <span className="ml-1 font-medium text-yellow-600">{testSuite.skippedTestCases}</span>
            </div>
          </div>
        </div>
        
        <div className="h-6"></div>
        <div className="pt-3 border-t mt-auto">
          <div className="relative">
            {isExecuting(executionId) && (
              <div className="absolute inset-0 bg-green-100 rounded-md overflow-hidden">
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
                className="w-full relative z-10 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 hover:border-blue-400"
                variant="outline"
                size="sm"
                onClick={handleNavigateToExecution}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Execution
              </Button>
            ) : (
              <Button
                className={`w-full relative z-10 ${
                  isExecuting(executionId)
                    ? 'bg-green-500 text-white hover:bg-green-600 border-green-500' 
                    : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 hover:border-green-400'
                }`}
                variant="outline"
                size="sm"
                onClick={handleExecute}
                disabled={isExecuting(executionId)}
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecuting(executionId) ? 'Executing...' : 'Execute Test Suite'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
