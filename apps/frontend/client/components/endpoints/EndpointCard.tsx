import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Clock,
  Eye,
  Globe,
  MoreVertical,
  TestTube,
  XCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import { Endpoint } from "../types/endpoint.types";

interface EndpointCardProps {
  endpoint: Endpoint;
  onViewDetails: (endpoint: Endpoint) => void;
  onGenerateTests: (endpoint: Endpoint) => void;
  onReanalyze: (endpoint: Endpoint) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export default function EndpointCard({
  endpoint,
  onViewDetails,
  onGenerateTests,
  onReanalyze,
  openDropdownId,
  setOpenDropdownId,
}: EndpointCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "analyzing":
      case "generating":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "failed":
        return "destructive";
      case "analyzing":
      case "generating":
      case "pending":
        return "secondary";
      default:
        return "secondary";
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

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(endpoint.status)}
            <Badge variant={getStatusColor(endpoint.status) as any}>
              {endpoint.status}
            </Badge>
          </div>
          <DropdownMenu 
            open={openDropdownId === endpoint.endpointId}
            onOpenChange={(open) => setOpenDropdownId(open ? endpoint.endpointId : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(endpoint)}>
                <Eye className="mr-2 h-4 w-4" />
                View & Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateTests(endpoint)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Tests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReanalyze(endpoint)}>
                <Zap className="mr-2 h-4 w-4" />
                Re-analyze
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{endpoint.name}</CardTitle>
        <div className="flex items-center text-sm mb-2">
          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
          <code className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
            {endpoint.path}
          </code>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {endpoint.methods.map((method, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method.method)}`}
              >
                {method.method}
              </span>
            ))}
          </div>
          {endpoint.projectName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">{endpoint.projectName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Section:</span>
            <span className="font-medium">{endpoint.section}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entity:</span>
            <span className="font-medium">{endpoint.entityName}</span>
          </div>
          <div className="pt-3 border-t">
            <Button 
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 border-green-300 hover:border-green-400" 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(endpoint)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 