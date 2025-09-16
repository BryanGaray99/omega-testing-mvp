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
  DialogTrigger,
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
  TestTube,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Endpoint, EndpointMethod, FieldDefinition } from "../types/endpoint.types";

interface EndpointRegisterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEndpoint: Endpoint | null;
  newEndpoint: {
    projectId: string;
    section: string;
    entityName: string;
    path: string;
    name: string;
    description: string;
    methods: EndpointMethod[];
  };
  setNewEndpoint: (endpoint: any) => void;
  projects: any[];
  registerActiveTab: string;
  setRegisterActiveTab: (tab: string) => void;
  onRegister: () => void;
  onUpdate: () => void;
  onCancel: () => void;
}

export default function EndpointRegisterDialog({
  isOpen,
  onOpenChange,
  editingEndpoint,
  newEndpoint,
  setNewEndpoint,
  projects,
  registerActiveTab,
  setRegisterActiveTab,
  onRegister,
  onUpdate,
  onCancel,
}: EndpointRegisterDialogProps) {
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

  const addMethod = () => {
    setNewEndpoint({
      ...newEndpoint,
      methods: [...newEndpoint.methods, { method: "GET", requiresAuth: false, requestBodyDefinition: [] }],
    });
  };

  const removeMethod = (index: number) => {
    setNewEndpoint({
      ...newEndpoint,
      methods: newEndpoint.methods.filter((_, i) => i !== index),
    });
  };

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
      
      const updatedMethods = [...newEndpoint.methods];
      const currentFields = updatedMethods[methodIndex].requestBodyDefinition || [];
      
      updatedMethods[methodIndex] = {
        ...updatedMethods[methodIndex],
        requestBodyDefinition: [...currentFields, ...newFields]
      };
      
      setNewEndpoint({
        ...newEndpoint,
        methods: updatedMethods
      });
      
      setJsonInput("");
      setShowJsonInput(null);
    } catch (error) {
      alert(`Error al procesar JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEndpoint ? "Edit Endpoint" : "Register New Endpoint"}
          </DialogTitle>
          <DialogDescription>
            {editingEndpoint 
              ? "Update the endpoint configuration."
              : "Configure a new API endpoint for testing and analysis."
            }
          </DialogDescription>
        </DialogHeader>
        <Tabs value={registerActiveTab} onValueChange={setRegisterActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project</label>
                  <Select
                    value={newEndpoint.projectId}
                    onValueChange={(value) =>
                      setNewEndpoint({ ...newEndpoint, projectId: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.displayName || project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  <Input
                    placeholder="e.g., ecommerce"
                    value={newEndpoint.section}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        section: e.target.value,
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entity *</label>
                  <Input
                    placeholder="e.g., Product"
                    value={newEndpoint.entityName}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        entityName: e.target.value,
                      })
                    }
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Display Name (Optional)</label>
                  <Input
                    placeholder="Product Management API"
                    value={newEndpoint.name}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        name: e.target.value,
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Path *</label>
                  <Input
                    placeholder="/products"
                    value={newEndpoint.path}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        path: e.target.value,
                      })
                    }
                    className="text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
                  <Textarea
                    placeholder="Brief description of the endpoint..."
                    value={newEndpoint.description}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        description: e.target.value,
                      })
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">HTTP Methods</h4>
              </div>
              
              {newEndpoint.methods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No HTTP methods configured yet.</p>
                  <p className="text-xs mt-1">Click "Add Method" to start configuring your endpoint.</p>
                </div>
              ) : (
                newEndpoint.methods.map((method, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
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
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: httpMethod as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}
                                >
                                  {httpMethod}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <span className="font-medium">{newEndpoint.path}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeMethod(index)}
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
                                            const updatedMethods = [...newEndpoint.methods];
                                            const updatedFields = method.requestBodyDefinition?.filter((_, i) => i !== fieldIndex) || [];
                                            updatedMethods[index] = {
                                              ...method,
                                              requestBodyDefinition: updatedFields
                                            };
                                            setNewEndpoint({
                                              ...newEndpoint,
                                              methods: updatedMethods
                                            });
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
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, name: e.target.value };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
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
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, type: value as any };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
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
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, example: e.target.value };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
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
                                                const updatedMethods = [...newEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { 
                                                  ...field, 
                                                  validations: { ...field.validations, required: checked }
                                                };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setNewEndpoint({
                                                  ...newEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }}
                                            />
                                            <span className="text-xs">Required</span>
                                          </div>
                                          
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={showValidationsForField[`${index}-${fieldIndex}`] || hasAdditionalValidations(field.validations)}
                                              onCheckedChange={(checked) => {
                                                const updatedMethods = [...newEndpoint.methods];
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
                                                setNewEndpoint({
                                                  ...newEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }}
                                            />
                                            <span className="text-xs">Validations</span>
                                            
                                            {(showValidationsForField[`${index}-${fieldIndex}`] || hasAdditionalValidations(field.validations)) && (
                                              <div className="ml-2 w-32">
                                                <Select
                                                  value=""
                                                  onValueChange={(value) => {
                                                    if (value) {
                                                      const updatedMethods = [...newEndpoint.methods];
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
                                                      setNewEndpoint({
                                                        ...newEndpoint,
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
                                                              const updatedMethods = [...newEndpoint.methods];
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
                                                              setNewEndpoint({
                                                                ...newEndpoint,
                                                                methods: updatedMethods
                                                              });
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
                                                              const updatedMethods = [...newEndpoint.methods];
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
                                                              setNewEndpoint({
                                                                ...newEndpoint,
                                                                methods: updatedMethods
                                                              });
                                                            }}
                                                            className="text-xs w-16"
                                                            placeholder={validationKey === "minLength" ? "1" : validationKey === "maxLength" ? "255" : "0"}
                                                          />
                                                        )}
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => {
                                                            const updatedMethods = [...newEndpoint.methods];
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
                                                            setNewEndpoint({
                                                              ...newEndpoint,
                                                              methods: updatedMethods
                                                            });
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
                            
                            {/* Add Field Buttons at the end of each method */}
                            <div className="flex flex-col gap-2 pt-2">
                              <div className="flex gap-2 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
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
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Add Method Button at the end */}
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addMethod}
                  className="w-full max-w-xs"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          {registerActiveTab === "methods" && !editingEndpoint ? (
            <Button
              variant="outline"
              onClick={() => setRegisterActiveTab("basic")}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          {editingEndpoint ? (
            <Button onClick={onUpdate}>
              Update Endpoint
            </Button>
          ) : registerActiveTab === "basic" ? (
            <Button onClick={() => setRegisterActiveTab("methods")}>
              Next
            </Button>
          ) : (
            <Button onClick={onRegister}>
              Register & Analyze
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 