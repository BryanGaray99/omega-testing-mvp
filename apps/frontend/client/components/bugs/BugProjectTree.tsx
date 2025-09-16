import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Bug } from "lucide-react";
import { Bug as BugType, BugStatus } from "@/components/types/bug.types";
import { BugJiraCard } from "./BugJiraCard";

interface ProjectOption {
  id: string;
  name?: string;
  displayName?: string;
}

interface BugProjectTreeProps {
  bugs: BugType[];
  projects: ProjectOption[];
  onViewDetails: (bug: BugType) => void;
  onEdit: (bug: BugType) => void;
  onDelete: (bug: BugType) => void;
  onStatusChange?: (bugId: string, newStatus: BugStatus) => void;
}

interface GroupedBugs {
  [projectId: string]: {
    project: ProjectOption;
    sections: {
      [section: string]: {
        entities: {
          [entity: string]: BugType[];
        };
      };
    };
  };
}

export function BugProjectTree({ bugs, projects, onViewDetails, onEdit, onDelete, onStatusChange }: BugProjectTreeProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Early return if bugs or projects are not available
  if (!bugs || !projects) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading bugs...</p>
        </CardContent>
      </Card>
    );
  }

  // Group bugs by project and section
  const groupedBugs: GroupedBugs = bugs.reduce((acc, bug) => {
    const projectId = bug.projectId || 'unknown';
    const section = bug.section || 'general';
    
    if (!acc[projectId]) {
      const project = projects.find(p => p.id === projectId) || { id: projectId, name: 'Unknown Project' };
      acc[projectId] = {
        project,
        sections: {}
      };
    }
    
    if (!acc[projectId].sections[section]) {
      acc[projectId].sections[section] = {
        entities: {}
      };
    }

    const entityKey = bug.entity || 'general';
    if (!acc[projectId].sections[section].entities[entityKey]) {
      acc[projectId].sections[section].entities[entityKey] = [];
    }
    
    acc[projectId].sections[section].entities[entityKey].push(bug);
    return acc;
  }, {} as GroupedBugs);

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const getProjectBugCount = (projectId: string) => {
    return Object.values(groupedBugs[projectId]?.sections || {}).reduce((sum, sectionData) => {
      return sum + Object.values(sectionData.entities || {}).reduce((sum, bugs) => sum + bugs.length, 0);
    }, 0);
  };

  const getSectionBugCount = (projectId: string, section: string) => {
    return groupedBugs[projectId]?.sections[section]?.entities || {};
  };

  if (bugs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No bugs found</h3>
          <p className="text-sm text-muted-foreground">
            No bugs have been reported yet. Create your first bug to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedBugs).map(([projectId, projectData]) => {
        const isProjectExpanded = expandedProjects.has(projectId);
        const projectBugCount = getProjectBugCount(projectId);
        
        return (
          <Card key={projectId} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <Collapsible open={isProjectExpanded} onOpenChange={() => toggleProject(projectId)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                    <div className="flex items-center space-x-2 w-full">
                      {isProjectExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {isProjectExpanded ? (
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Folder className="h-4 w-4 text-blue-500" />
                      )}
                      <div className="flex-1 text-left">
                        <CardTitle className="text-base font-medium">
                          {projectData.project.displayName || projectData.project.name || 'Unknown Project'}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {projectBugCount} {projectBugCount === 1 ? 'bug' : 'bugs'}
                      </Badge>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4 space-y-3">
                  {Object.entries(projectData.sections).map(([section, sectionData]) => {
                    const sectionKey = `${projectId}-${section}`;
                    const isSectionExpanded = expandedSections.has(sectionKey);
                    const sectionBugCount = Object.values(sectionData.entities || {}).reduce((sum, bugs) => sum + bugs.length, 0);
                    
                    return (
                      <div key={sectionKey} className="ml-6">
                        <Collapsible open={isSectionExpanded} onOpenChange={() => toggleSection(sectionKey)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                              <div className="flex items-center space-x-2 w-full">
                                {isSectionExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                <Bug className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-medium capitalize">
                                  {section === 'general' ? 'General' : section}
                                </span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {sectionBugCount}
                                </Badge>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-2 space-y-2">
                            {Object.entries(sectionData.entities).map(([entity, entityBugs]) => {
                              const entityKey = `${sectionKey}-${entity}`;
                              const isEntityExpanded = expandedSections.has(entityKey);
                              const entityBugCount = entityBugs.length;
                              
                              return (
                                <div key={entityKey} className="ml-4">
                                  <Collapsible open={isEntityExpanded} onOpenChange={() => toggleSection(entityKey)}>
                                    <CollapsibleTrigger asChild>
                                      <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                                        <div className="flex items-center space-x-2 w-full">
                                          {isEntityExpanded ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                          <Bug className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-sm font-medium capitalize">
                                            {entity === 'general' ? 'General' : entity}
                                          </span>
                                          <Badge variant="outline" className="ml-auto text-xs">
                                            {entityBugCount}
                                          </Badge>
                                        </div>
                                      </Button>
                                    </CollapsibleTrigger>
                                    
                                    <CollapsibleContent className="mt-2 space-y-2">
                                      {entityBugs.map((bug) => (
                                        <div key={bug.bugId} className="ml-4">
                                          <BugJiraCard
                                            bug={bug}
                                            onViewDetails={onViewDetails}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onStatusChange={onStatusChange}
                                          />
                                        </div>
                                      ))}
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
