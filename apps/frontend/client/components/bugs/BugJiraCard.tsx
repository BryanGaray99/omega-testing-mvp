import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, User, AlertTriangle } from "lucide-react";
import { Bug as BugType, BugType as BugTypeEnum, BugSeverity, BugPriority, BugStatus } from "@/components/types/bug.types";
import { getPriorityColor, getSeverityColor, getStatusColor } from "@/lib/colors";

interface BugJiraCardProps {
  bug: BugType;
  onViewDetails: (bug: BugType) => void;
  onEdit: (bug: BugType) => void;
  onDelete: (bug: BugType) => void;
  onStatusChange?: (bugId: string, newStatus: BugStatus) => void;
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'system_bug':
      return '🐛';
    case 'framework_error':
      return '⚙️';
    case 'test_failure':
      return '❌';
    case 'environment_issue':
      return '🌍';
    default:
      return '📋';
  }
};

// Helper functions to get CSS classes for badges
const getSeverityBadgeClass = (severity: BugSeverity) => {
  const colors = getSeverityColor(severity);
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

const getPriorityBadgeClass = (priority: BugPriority) => {
  const colors = getPriorityColor(priority);
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

const getStatusBadgeClass = (status: BugStatus) => {
  const colors = getStatusColor(status);
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

export function BugJiraCard({ bug, onViewDetails, onEdit, onDelete, onStatusChange }: BugJiraCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md border-l-4 ${
        bug.severity === 'critical' ? 'border-l-red-500' :
        bug.severity === 'high' ? 'border-l-orange-500' :
        bug.severity === 'medium' ? 'border-l-yellow-500' :
        'border-l-green-500'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Header Row - Bug ID, Type Icon, Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getTypeIcon(bug.type)}
            </div>
            <div>
              <span className="font-mono text-sm text-muted-foreground">
                {bug.bugId}
              </span>
            </div>
          </div>
          
          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <Select 
              value={bug.status} 
              onValueChange={(value: BugStatus) => onStatusChange?.(bug.bugId, value)}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BugStatus.OPEN}>Open</SelectItem>
                <SelectItem value={BugStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={BugStatus.RESOLVED}>Resolved</SelectItem>
                <SelectItem value={BugStatus.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                >
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
                  Edit Bug
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(bug)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Bug
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-medium text-sm mb-1">
            {bug.title}
          </h3>
          {bug.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {bug.description}
            </p>
          )}
        </div>

        {/* Grid Layout - 2 rows of 3 columns */}
        <div className="space-y-3 mb-3">
          {/* Row 1: Name and Description */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Name:</span> {bug.title}
              </div>
              {bug.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Description:</span> {bug.description}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Type:</span> {bug.type.replace('_', ' ')}
            </div>
          </div>

          {/* Row 2: Priority/Severity with labels, Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Priority:</span>
              </div>
              <Badge variant="outline" className={getPriorityBadgeClass(bug.priority)}>
                {bug.priority}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Severity:</span>
              </div>
              <Badge variant="outline" className={getSeverityBadgeClass(bug.severity)}>
                {bug.severity}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Date:</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(bug.reportedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message preview */}
        {bug.errorMessage && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center space-x-1 text-red-700 mb-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-600 line-clamp-2">
              {bug.errorMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
