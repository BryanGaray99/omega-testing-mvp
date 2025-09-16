import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
} from "lucide-react";
import { Endpoint, EndpointMethod, FieldDefinition } from "../types/endpoint.types";

interface EndpointComprehensiveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEndpoint: Endpoint | null;
  editingComprehensiveEndpoint: Endpoint | null;
  setEditingComprehensiveEndpoint: (endpoint: Endpoint | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isUpdating: boolean;
  projects: any[];
  onUpdate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EndpointComprehensiveDialog({
  isOpen,
  onOpenChange,
  selectedEndpoint,
  editingComprehensiveEndpoint,
  setEditingComprehensiveEndpoint,
  isEditing,
  setIsEditing,
  isUpdating,
  projects,
  onUpdate,
  onDelete,
  onClose,
}: EndpointComprehensiveDialogProps) {
  const [jsonInput, setJsonInput] = React.useState<string>("");
  const [showJsonInput, setShowJsonInput] = React.useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

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

  const hasAdditionalValidations = (validations: Record<string, any> | undefined) => {
    if (!validations) return false;
    const keys = Object.keys(validations);
    return keys.filter(key => key !== 'required').length > 0;
  };

  const getAvailableValidations = (fieldType: string) => {
    if (fieldType === "number") {
      return [
        { value: "minimum", label: "Minimum Value" },
        { value: "maximum", label: "Maximum Value" }
      ];
    } else if (fieldType === "string") {
      return [
        { value: "minLength", label: "Min Length" },
        { value: "maxLength", label: "Max Length" }
      ];
    } else if (fieldType === "boolean") {
      return [
        { value: "default", label: "Default Value" }
      ];
    }
    return [];
  };

  const getSelectedValidations = (validations: Record<string, any> | undefined) => {
    if (!validations) return [];
    return Object.keys(validations).filter(key => key !== 'required');
  };

  // Estado para controlar si se muestran las validaciones para cada campo
  const [showValidationsForField, setShowValidationsForField] = React.useState<Record<string, boolean>>({});

  // Inicializar el estado de validaciones cuando se abre el diálogo
  React.useEffect(() => {
    if (isOpen && selectedEndpoint) {
      const initialValidationsState: Record<string, boolean> = {};
      selectedEndpoint.methods.forEach((method, methodIndex) => {
        method.requestBodyDefinition?.forEach((field, fieldIndex) => {
          const key = `${methodIndex}-${fieldIndex}`;
          initialValidationsState[key] = hasAdditionalValidations(field.validations);
        });
      });
      setShowValidationsForField(initialValidationsState);
    }
  }, [isOpen, selectedEndpoint]);

  const parseJsonFields = (jsonString: string): FieldDefinition[] => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON debe ser un array");
      }
      
      return parsed.map((item: any) => {
        if (!item.name || !item.type) {
          throw new Error("Cada campo debe tener 'name' y 'type'");
        }
        
        return {
          name: item.name,
          type: item.type,
          example: item.example || "",
          validations: item.validations || { required: false }
        };
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw error;
    }
  };

  const handleAddFieldsWithJson = (methodIndex: number) => {
    try {
      const newFields = parseJsonFields(jsonInput);
      
      if (editingComprehensiveEndpoint) {
        const updatedMethods = [...editingComprehensiveEndpoint.methods];
        const currentFields = updatedMethods[methodIndex].requestBodyDefinition || [];
        
        updatedMethods[methodIndex] = {
          ...updatedMethods[methodIndex],
          requestBodyDefinition: [...currentFields, ...newFields]
        };
        
        setEditingComprehensiveEndpoint({
          ...editingComprehensiveEndpoint,
          methods: updatedMethods
        });
        
        setJsonInput("");
        setShowJsonInput(null);
      }
    } catch (error) {
      alert(`Error al procesar JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (!selectedEndpoint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedEndpoint?.name || "Endpoint Details"}
          </DialogTitle>
          <DialogDescription>
            View and edit endpoint details, generated artifacts, and analysis results.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="artifacts">Generated Artifacts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
            <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Basic Information</h3>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Endpoint Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project</label>
                  <p className="text-sm">{selectedEndpoint.projectName || 'Unknown Project'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base URL + API Path</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                    {projects.find(p => p.id === selectedEndpoint.projectId)?.baseUrl || 'http://localhost:3004'}{projects.find(p => p.id === selectedEndpoint.projectId)?.basePath || '/v1/api'}{selectedEndpoint.path}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  {isEditing ? (
                    <Input
                      value={editingComprehensiveEndpoint?.section || ''}
                      onChange={(e) => {
                        if (editingComprehensiveEndpoint) {
                          setEditingComprehensiveEndpoint({
                            ...editingComprehensiveEndpoint,
                            section: e.target.value
                          });
                        }
                      }}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{selectedEndpoint.section}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entity</label>
                  {isEditing ? (
                    <Input
                      value={editingComprehensiveEndpoint?.entityName || ''}
                      onChange={(e) => {
                        if (editingComprehensiveEndpoint) {
                          setEditingComprehensiveEndpoint({
                            ...editingComprehensiveEndpoint,
                            entityName: e.target.value
                          });
                        }
                      }}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{selectedEndpoint.entityName}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Path</label>
                  {isEditing ? (
                    <Input
                      value={editingComprehensiveEndpoint?.path || ''}
                      onChange={(e) => {
                        if (editingComprehensiveEndpoint) {
                          setEditingComprehensiveEndpoint({
                            ...editingComprehensiveEndpoint,
                            path: e.target.value
                          });
                        }
                      }}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{selectedEndpoint.path}</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">HTTP Methods</h3>
            </div>
            
            {isEditing ? (
              <div>
                {editingComprehensiveEndpoint?.methods.map((method, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getMethodColor(method.method)}`}>
                            {method.method}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((httpMethod) => (
                                <DropdownMenuItem 
                                  key={httpMethod}
                                  onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: httpMethod as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}
                                >
                                  {httpMethod}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <span className="font-medium">{selectedEndpoint.path}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (editingComprehensiveEndpoint) {
                            const updatedMethods = editingComprehensiveEndpoint.methods.filter((_, i) => i !== index);
                            setEditingComprehensiveEndpoint({
                              ...editingComprehensiveEndpoint,
                              methods: updatedMethods
                            });
                          }
                        }}
                        className="hover:bg-red-100 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {method.method !== "GET" && method.method !== "DELETE" && (
                      <div className="mt-3">
                        <div
                          className="flex items-center justify-between mb-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                          onClick={() => {
                            const sectionKey = `method-${index}`;
                            setCollapsedSections(prev => ({
                              ...prev,
                              [sectionKey]: !prev[sectionKey]
                            }));
                          }}
                        >
                          <h5 className="font-medium text-sm">Request Body Definition</h5>
                          {collapsedSections[`method-${index}`] ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        {!collapsedSections[`method-${index}`] && (
                          <>
                            {method.requestBodyDefinition && method.requestBodyDefinition.length > 0 && (
                              <div className="bg-muted rounded p-2">
                                <div className="space-y-2">
                                  {method.requestBodyDefinition.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="border rounded p-3 bg-background">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">Field {fieldIndex + 1}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => {
                                            if (editingComprehensiveEndpoint) {
                                              const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                              const updatedFields = method.requestBodyDefinition?.filter((_, i) => i !== fieldIndex) || [];
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setEditingComprehensiveEndpoint({
                                                ...editingComprehensiveEndpoint,
                                                methods: updatedMethods
                                              });
                                            }
                                          }}
                                          className="hover:bg-red-100 hover:text-red-600 hover:border-red-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-xs font-medium">Name *</label>
                                          <Input
                                            value={field.name}
                                            onChange={(e) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, name: e.target.value };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                            className="text-xs"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Type *</label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, type: value as any };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="string">string</SelectItem>
                                              <SelectItem value="number">number</SelectItem>
                                              <SelectItem value="boolean">boolean</SelectItem>
                                              <SelectItem value="object">object</SelectItem>
                                              <SelectItem value="array">array</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Example</label>
                                          <Input
                                            value={field.example || ''}
                                            onChange={(e) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, example: e.target.value };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                            className="text-xs"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={field.validations?.required || false}
                                              onCheckedChange={(checked) => {
                                                if (editingComprehensiveEndpoint) {
                                                  const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                  const updatedFields = [...(method.requestBodyDefinition || [])];
                                                  updatedFields[fieldIndex] = { 
                                                    ...field, 
                                                    validations: { ...field.validations, required: checked }
                                                  };
                                                  updatedMethods[index] = {
                                                    ...method,
                                                    requestBodyDefinition: updatedFields
                                                  };
                                                  setEditingComprehensiveEndpoint({
                                                    ...editingComprehensiveEndpoint,
                                                    methods: updatedMethods
                                                  });
                                                }
                                              }}
                                            />
                                            <span className="text-xs">Required</span>
                                          </div>
                                          
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={showValidationsForField[`${index}-${fieldIndex}`] || hasAdditionalValidations(field.validations)}
                                              onCheckedChange={(checked) => {
                                                if (editingComprehensiveEndpoint) {
                                                  const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                  const updatedFields = [...(method.requestBodyDefinition || [])];
                                                  
                                                  if (!checked) {
                                                    const required = field.validations?.required || false;
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: required ? { required } : {}
                                                    };
                                                    // Ocultar validaciones cuando se desmarca
                                                    setShowValidationsForField(prev => ({
                                                      ...prev,
                                                      [`${index}-${fieldIndex}`]: false
                                                    }));
                                                  } else {
                                                    // Mostrar validaciones cuando se marca
                                                    setShowValidationsForField(prev => ({
                                                      ...prev,
                                                      [`${index}-${fieldIndex}`]: true
                                                    }));
                                                  }
                                                  
                                                  updatedMethods[index] = {
                                                    ...method,
                                                    requestBodyDefinition: updatedFields
                                                  };
                                                  setEditingComprehensiveEndpoint({
                                                    ...editingComprehensiveEndpoint,
                                                    methods: updatedMethods
                                                  });
                                                }
                                              }}
                                            />
                                            <span className="text-xs">Validations</span>
                                            
                                            {(showValidationsForField[`${index}-${fieldIndex}`] || hasAdditionalValidations(field.validations)) && (
                                              <div className="ml-2 w-32">
                                                <Select
                                                  value=""
                                                  onValueChange={(value) => {
                                                    if (editingComprehensiveEndpoint && value) {
                                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                      const updatedFields = [...(method.requestBodyDefinition || [])];
                                                      const currentValidations = field.validations || {};
                                                      
                                                                                                             let defaultValue: any = 0;
                                                       if (value === "minLength" || value === "maxLength") {
                                                         defaultValue = value === "minLength" ? 1 : 255;
                                                       } else if (value === "default") {
                                                         defaultValue = true; // Default para boolean
                                                       }
                                                       
                                                       updatedFields[fieldIndex] = { 
                                                         ...field, 
                                                         validations: { 
                                                           ...currentValidations, 
                                                           [value]: defaultValue 
                                                         }
                                                       };
                                                      
                                                      updatedMethods[index] = {
                                                        ...method,
                                                        requestBodyDefinition: updatedFields
                                                      };
                                                      setEditingComprehensiveEndpoint({
                                                        ...editingComprehensiveEndpoint,
                                                        methods: updatedMethods
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <SelectTrigger className="h-6 text-xs">
                                                    <SelectValue placeholder="Add validation" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {getAvailableValidations(field.type)
                                                      .filter(validation => !getSelectedValidations(field.validations).includes(validation.value))
                                                      .map(validation => (
                                                        <SelectItem key={validation.value} value={validation.value}>
                                                          {validation.label}
                                                        </SelectItem>
                                                      ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Validation-specific fields */}
                                        {(showValidationsForField[`${index}-${fieldIndex}`] || hasAdditionalValidations(field.validations)) && (
                                          <div className="mt-3">
                                            <div className="text-xs font-medium text-muted-foreground mb-2">
                                              Validation Rules:
                                            </div>
                                            
                                            <div className="w-1/4">
                                              <div className="flex flex-row gap-2">
                                                {getSelectedValidations(field.validations).map((validationKey) => {
                                                  const validationLabel = getAvailableValidations(field.type)
                                                    .find(v => v.value === validationKey)?.label || validationKey;
                                                  
                                                  return (
                                                    <div key={validationKey} className="flex flex-col items-start space-y-1">
                                                      <label className="text-xs font-medium whitespace-nowrap">{validationLabel}</label>
                                                      <div className="flex items-center space-x-1">
                                                        {validationKey === "default" ? (
                                                          <Select
                                                            value={field.validations?.[validationKey]?.toString() || "true"}
                                                            onValueChange={(value) => {
                                                              if (editingComprehensiveEndpoint) {
                                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                                updatedFields[fieldIndex] = { 
                                                                  ...field, 
                                                                  validations: { 
                                                                    ...field.validations, 
                                                                    [validationKey]: value === "true" 
                                                                  }
                                                                };
                                                                updatedMethods[index] = {
                                                                  ...method,
                                                                  requestBodyDefinition: updatedFields
                                                                };
                                                                setEditingComprehensiveEndpoint({
                                                                  ...editingComprehensiveEndpoint,
                                                                  methods: updatedMethods
                                                                });
                                                              }
                                                            }}
                                                          >
                                                            <SelectTrigger className="text-xs w-16">
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              <SelectItem value="true">True</SelectItem>
                                                              <SelectItem value="false">False</SelectItem>
                                                            </SelectContent>
                                                          </Select>
                                                        ) : (
                                                          <Input
                                                            type="number"
                                                            value={field.validations?.[validationKey] || ''}
                                                            onChange={(e) => {
                                                              if (editingComprehensiveEndpoint) {
                                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                                updatedFields[fieldIndex] = { 
                                                                  ...field, 
                                                                  validations: { 
                                                                    ...field.validations, 
                                                                    [validationKey]: e.target.value !== '' ? Number(e.target.value) : undefined 
                                                                  }
                                                                };
                                                                updatedMethods[index] = {
                                                                  ...method,
                                                                  requestBodyDefinition: updatedFields
                                                                };
                                                                setEditingComprehensiveEndpoint({
                                                                  ...editingComprehensiveEndpoint,
                                                                  methods: updatedMethods
                                                                });
                                                              }
                                                            }}
                                                            className="text-xs w-16"
                                                            placeholder={validationKey === "minLength" ? "1" : validationKey === "maxLength" ? "255" : "0"}
                                                          />
                                                        )}
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => {
                                                            if (editingComprehensiveEndpoint) {
                                                              const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                                              const newValidations = { ...field.validations };
                                                              delete newValidations[validationKey];
                                                              
                                                              updatedFields[fieldIndex] = { 
                                                                ...field, 
                                                                validations: newValidations
                                                              };
                                                              updatedMethods[index] = {
                                                                ...method,
                                                                requestBodyDefinition: updatedFields
                                                              };
                                                              setEditingComprehensiveEndpoint({
                                                                ...editingComprehensiveEndpoint,
                                                                methods: updatedMethods
                                                              });
                                                            }
                                                          }}
                                                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Add Field Buttons at the end of each method */}
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (editingComprehensiveEndpoint) {
                                  const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                  const newField: FieldDefinition = {
                                    name: "newField",
                                    type: "string",
                                    example: "",
                                    validations: { required: false }
                                  };
                                  updatedMethods[index] = {
                                    ...method,
                                    requestBodyDefinition: [...(method.requestBodyDefinition || []), newField]
                                  };
                                  setEditingComprehensiveEndpoint({
                                    ...editingComprehensiveEndpoint,
                                    methods: updatedMethods
                                  });
                                }
                              }}
                              className="flex-1 max-w-xs"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowJsonInput(showJsonInput === index ? null : index)}
                              className="flex-1 max-w-xs"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Add Fields with JSON
                            </Button>
                          </div>
                          
                          {showJsonInput === index && (
                            <div className="border rounded-lg p-3 bg-muted/50">
                              <div className="mb-2">
                                <label className="text-sm font-medium">JSON Array de Campos</label>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Pega un array JSON con la estructura de los campos
                                </p>
                              </div>
                              <Textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder={`[
  {
    "name": "name",
    "type": "string",
    "example": "iPhone 15 Pro",
    "validations": {
      "minLength": 2,
      "required": true
    }
  },
  {
    "name": "price",
    "type": "number",
    "example": 999.99,
    "validations": {
      "minimum": 0,
      "required": true
    }
  }
]`}
                                className="min-h-[120px] text-xs font-mono"
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddFieldsWithJson(index)}
                                  className="flex-1"
                                >
                                  Insertar Campos
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setShowJsonInput(null);
                                    setJsonInput("");
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Method Button at the end */}
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (editingComprehensiveEndpoint) {
                        setEditingComprehensiveEndpoint({
                          ...editingComprehensiveEndpoint,
                          methods: [...editingComprehensiveEndpoint.methods, { method: "GET", requiresAuth: false, requestBodyDefinition: [] }]
                        });
                      }
                    }}
                    className="w-full max-w-xs"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {selectedEndpoint.methods.map((method, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getMethodColor(method.method)}`}>
                            {method.method}
                          </Badge>
                        </div>
                        <span className="font-medium">{selectedEndpoint.path}</span>
                      </div>
                    </div>

                    {method.method !== "GET" && method.method !== "DELETE" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">Request Body Definition</h5>
                        </div>
                      
                        {method.requestBodyDefinition && method.requestBodyDefinition.length > 0 && (
                          <div className="bg-muted rounded p-2">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border/50">
                                  <th className="text-left py-1 font-medium">Field</th>
                                  <th className="text-left py-1 font-medium">Type</th>
                                  <th className="text-left py-1 font-medium">Required</th>
                                  <th className="text-left py-1 font-medium">Validations</th>
                                </tr>
                              </thead>
                              <tbody>
                                {method.requestBodyDefinition.map((field, fieldIndex) => (
                                  <tr key={fieldIndex} className="border-b border-border/30 last:border-b-0">
                                    <td className="py-1">
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{field.name}</span>
                                        {field.validations?.required && <span className="text-gray-500">*</span>}
                                      </div>
                                    </td>
                                    <td className="py-1">
                                      <Badge variant="outline" className="text-xs">
                                        {field.type}
                                      </Badge>
                                    </td>
                                    <td className="py-1">
                                      {field.validations?.required ? (
                                        <Badge variant="secondary" className="text-xs">True</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">False</Badge>
                                      )}
                                    </td>
                                    <td className="py-1">
                                      <div className="flex flex-wrap gap-1">
                                        {field.type === "number" && field.validations?.minimum !== undefined && (
                                          <Badge variant="outline" className="text-xs">Min Value: {field.validations.minimum}</Badge>
                                        )}
                                        {field.type === "number" && field.validations?.maximum !== undefined && (
                                          <Badge variant="outline" className="text-xs">Max Value: {field.validations.maximum}</Badge>
                                        )}
                                        {field.type === "string" && field.validations?.minLength !== undefined && (
                                          <Badge variant="outline" className="text-xs">Min Length: {field.validations.minLength}</Badge>
                                        )}
                                        {field.type === "string" && field.validations?.maxLength !== undefined && (
                                          <Badge variant="outline" className="text-xs">Max Length: {field.validations.maxLength}</Badge>
                                        )}
                                        {(!field.validations || Object.keys(field.validations).filter(key => key !== 'required').length === 0) && (
                                          <span className="text-muted-foreground text-xs">No validations</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timestamps" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Timestamps</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedEndpoint.createdAt ? new Date(selectedEndpoint.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
              {selectedEndpoint.updatedAt && (
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEndpoint.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-4">
            {selectedEndpoint.generatedArtifacts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedEndpoint.generatedArtifacts).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 capitalize">{key}</h4>
                    <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                      {value || "No data available"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No generated artifacts available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {selectedEndpoint.analysisResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedEndpoint.analysisResults).map(([method, results]) => (
                  <div key={method} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${getMethodColor(method)}`}>
                        {method}
                      </Badge>
                      <h4 className="font-medium text-sm">{method} Analysis</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-xs">
                        {results.statusCode && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Status:</span>
                            <Badge variant="outline" className="text-xs">{results.statusCode}</Badge>
                          </div>
                        )}
                        {results.contentType && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline" className="text-xs">{results.contentType}</Badge>
                          </div>
                        )}
                      </div>
                      
                      {results.responseFields && results.responseFields.length > 0 && (
                        <div>
                          <span className="font-medium text-xs mb-2 block">Response Fields:</span>
                          <div className="bg-muted rounded p-2">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border/50">
                                  <th className="text-left py-1 font-medium">Field</th>
                                  <th className="text-left py-1 font-medium">Type</th>
                                  {results.responseFields.some(f => !f.required) && (
                                    <th className="text-left py-1 font-medium">Required</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {results.responseFields.map((field, fieldIndex) => (
                                  <tr key={fieldIndex} className="border-b border-border/30 last:border-b-0">
                                    <td className="py-1">
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{field.name}</span>
                                        {field.required && <span className="text-gray-500">*</span>}
                                      </div>
                                    </td>
                                    <td className="py-1">
                                      <Badge variant="outline" className="text-xs">
                                        {field.type}
                                      </Badge>
                                    </td>
                                    {results.responseFields.some(f => !f.required) && (
                                      <td className="py-1">
                                        {field.required ? (
                                          <Badge variant="secondary" className="text-xs">
                                            Required
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">Optional</span>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analysis results available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          {!isEditing ? (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Modify
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditingComprehensiveEndpoint(selectedEndpoint ? {
                    ...selectedEndpoint,
                    methods: selectedEndpoint.methods.map(method => ({
                      ...method,
                      requestBodyDefinition: method.requestBodyDefinition?.map(field => ({
                        ...field,
                        validations: field.validations || {}
                      }))
                    }))
                  } : null);
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={onUpdate}
                disabled={isUpdating}
                className="bg-blue-700 hover:bg-blue-800"
              >
                {isUpdating ? 'Saving...' : 'Update'}
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            onClick={onDelete}
          >
            Delete Endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 