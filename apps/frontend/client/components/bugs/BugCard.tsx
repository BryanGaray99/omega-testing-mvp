import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Bug } from "lucide-react";
import { Bug as BugType, BugType as BugTypeEnum, BugSeverity, BugPriority, BugStatus } from "@/components/types/bug.types";
import { getPriorityColor, getSeverityColor, getStatusColor } from "@/lib/colors";

interface BugCardProps {
  bug: BugType;
  onViewDetails: (bug: BugType) => void;
  onEdit: (bug: BugType) => void;
  onDelete: (bug: BugType) => void;
}

const getTypeIcon = (type: BugTypeEnum) => {
  switch (type) {
    case BugTypeEnum.SYSTEM_BUG:
      return "🐛";
    case BugTypeEnum.FRAMEWORK_ERROR:
      return "⚙️";
    case BugTypeEnum.TEST_FAILURE:
      return "❌";
    case BugTypeEnum.ENVIRONMENT_ISSUE:
      return "🌍";
    default:
      return "🐛";
  }
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

export function BugCard({ bug, onViewDetails, onEdit, onDelete }: BugCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(bug.type)}</span>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {bug.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(bug)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(bug)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(bug)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {bug.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getSeverityBadgeClass(bug.severity)}>
            {bug.severity}
          </Badge>
          <Badge className={getPriorityBadgeClass(bug.priority)}>
            {bug.priority}
          </Badge>
          <Badge className={getStatusBadgeClass(bug.status)}>
            {bug.status}
          </Badge>
        </div>

        {/* Context Info */}
        <div className="space-y-2 text-sm">
          {bug.section && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Section:</span>
              <span className="text-muted-foreground">{bug.section}</span>
            </div>
          )}
          {bug.entity && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Entity:</span>
              <span className="text-muted-foreground">{bug.entity}</span>
            </div>
          )}
          {bug.method && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Method:</span>
              <span className="text-muted-foreground">{bug.method}</span>
            </div>
          )}
        </div>

        {/* Error Info */}
        {bug.errorMessage && (
          <div className="text-sm">
            <span className="font-medium">Error:</span>
            <p className="text-muted-foreground line-clamp-1 mt-1">
              {bug.errorMessage}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Reported: {formatDate(bug.reportedAt)}</div>
          {bug.resolvedAt && (
            <div>Resolved: {formatDate(bug.resolvedAt)}</div>
          )}
        </div>

        {/* Main Action Button */}
        <div className="pt-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => onViewDetails(bug)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
