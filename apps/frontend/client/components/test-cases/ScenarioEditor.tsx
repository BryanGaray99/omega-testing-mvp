import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  GripVertical, 
  Search,
  FileText,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TestCase } from '@/components/types/testCase.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step {
  id: string;
  type: 'Given' | 'When' | 'Then' | 'And';
  content: string;
  isEditing?: boolean;
  parameters?: Record<string, string>; // Parámetros editables como {int}, {string}, etc.
  originalDefinition?: string; // Definición original del step para referencia
}

// Función para detectar parámetros en una definición de step
const extractParameters = (definition: string): string[] => {
  const parameterRegex = /\{([^}]+)\}/g;
  const parameters: string[] = [];
  let match;
  
  while ((match = parameterRegex.exec(definition)) !== null) {
    parameters.push(match[1]); // Capturar el contenido dentro de {}
  }
  
  return parameters;
};

// Función para reemplazar parámetros en una definición
const replaceParameters = (definition: string, parameters: Record<string, string>): string => {
  let result = definition;
  
  Object.entries(parameters).forEach(([key, value]) => {
    // Escapar caracteres especiales en el regex
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\{${escapedKey}\\}`, 'g');
    result = result.replace(regex, value || `{${key}}`);
  });
  
  return result;
};

interface AvailableStep {
  id: string;
  stepId: string;
  projectId: string;
  name: string;
  definition: string;
  type: 'Given' | 'When' | 'Then';
  stepType: string;
  parameters: any[];
  implementation: string;
  validation: any;
  status: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface OrganizedSteps {
  Given: { common: AvailableStep[]; entity: AvailableStep[] };
  When: { common: AvailableStep[]; entity: AvailableStep[] };
  Then: { common: AvailableStep[]; entity: AvailableStep[] };
}

interface ScenarioEditorProps {
  testCase: TestCase;
  projectId: string;
  onSave: (steps: Step[], tags: string[], scenario: string) => void;
  onCancel: () => void;
  isPending?: boolean;
  onChange?: (steps: Step[], tags: string[], scenario: string) => void;
}

// Función para obtener colores pastel según el tipo de step
const getStepColor = (type: string, steps?: Step[], currentIndex?: number) => {
  switch (type) {
    case 'Given':
      return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800';
    case 'When':
      return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800';
    case 'Then':
      return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800';
    case 'And':
      // Para And, usar el color del último step del tipo correspondiente
      if (steps && currentIndex !== undefined) {
        // Buscar hacia atrás el último step que no sea 'And'
        for (let i = currentIndex - 1; i >= 0; i--) {
          const previousStep = steps[i];
          if (previousStep.type !== 'And') {
            return getStepColor(previousStep.type);
          }
        }
      }
      // Si no hay step anterior, usar amarillo por defecto
      return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800';
    default:
      return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800';
  }
};

// Componente para cada step sortable
function SortableStep({ 
  step, 
  onRemove,
  steps,
  index,
  onUpdateStep
}: { 
  step: Step; 
  onRemove: (stepId: string) => void;
  steps: Step[];
  index: number;
  onUpdateStep: (stepId: string, updates: Partial<Step>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Generar el contenido del step con parámetros reemplazados
  const getStepContent = () => {
    if (step.parameters && step.originalDefinition) {
      return replaceParameters(step.originalDefinition, step.parameters);
    }
    return step.content;
  };

  const handleParameterChange = (paramKey: string, value: string) => {
    if (step.parameters) {
      const updatedParameters = { ...step.parameters, [paramKey]: value };
      onUpdateStep(step.id, { parameters: updatedParameters });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 p-1.5 border rounded ${getStepColor(step.type, steps, index)}`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        
        <div className="w-16 text-xs font-medium px-2 py-1 bg-white/80 rounded border">
          {step.type}
        </div>
        
        <div className="flex-1 text-sm px-2 py-1 font-medium">
          {getStepContent()}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(step.id)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Campos editables para parámetros */}
      {step.parameters && Object.keys(step.parameters).length > 0 && (
        <div className="flex flex-wrap gap-2 ml-6">
          {Object.entries(step.parameters).map(([paramKey, paramValue]) => (
            <div key={paramKey} className="flex items-center gap-1">
              <Label className="text-xs font-medium text-muted-foreground">
                {paramKey}:
              </Label>
              <Input
                type="text"
                value={paramValue}
                onChange={(e) => handleParameterChange(paramKey, e.target.value)}
                placeholder={`Enter ${paramKey}`}
                className="h-6 text-xs w-24"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para available steps clickeables
function ClickableAvailableStep({ 
  step, 
  onAdd 
}: { 
  step: AvailableStep; 
  onAdd: (step: AvailableStep) => void;
}) {
  return (
    <div
      className={`p-1.5 rounded text-xs cursor-pointer transition-colors border ${getStepColor(step.type)}`}
      onClick={() => onAdd(step)}
      title={step.definition}
    >
      <span className="truncate font-medium">{step.name}</span>
    </div>
  );
}

export default function ScenarioEditor({
  testCase,
  projectId,
  onSave,
  onCancel,
  isPending = false,
  onChange,
}: ScenarioEditorProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [availableSteps, setAvailableSteps] = useState<OrganizedSteps | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [examples, setExamples] = useState<string[]>(['field']);
  const [examplesValues, setExamplesValues] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [stepSearchTerms, setStepSearchTerms] = useState<Record<string, string>>({});
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Avoid re-initializing from props on each render
  const initKeyRef = useRef<string | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  useEffect(() => {
    const key = `${projectId}:${testCase.testCaseId}`;
    if (initKeyRef.current === key) return; // already initialized for this test
    initKeyRef.current = key;

    // Parse existing scenario into steps and examples
    isSyncingRef.current = true;
    const scenarioLines = (testCase.scenario || '').split('\n');
    const parsedSteps: Step[] = [];
    let foundExamples = false;
    let examplesData: string[] = [];
    let examplesValues: string[][] = [];
    let inExamplesTable = false;
    let headerRow: string[] = [];
    
    for (let i = 0; i < scenarioLines.length; i++) {
      const line = scenarioLines[i].trim();
      if (!line) continue;
      
      // Detectar si es la línea "Examples:"
      if (line.toLowerCase() === 'examples:') {
        foundExamples = true;
        continue;
      }
      
      // Si encontramos Examples, procesar las líneas siguientes
      if (foundExamples) {
        // Detectar si es una línea de tabla (contiene |)
        if (line.includes('|')) {
          // Extraer las columnas de la línea
          const columns = line.split('|').map(col => col.trim()).filter(col => col);
          
          if (columns.length > 0) {
            if (!inExamplesTable) {
              // Es la primera línea de tabla (headers)
              headerRow = columns;
              inExamplesTable = true;
            } else {
              // Es una fila de datos
              examplesValues.push(columns);
            }
          }
        } else {
          // Si no contiene |, probablemente terminó la tabla
          inExamplesTable = false;
        }
        continue;
      }
      
      // Procesar steps normales (antes de Examples)
      let type: 'Given' | 'When' | 'Then' | 'And' = 'Given';
      
      if (line.startsWith('Given')) type = 'Given';
      else if (line.startsWith('When')) type = 'When';
      else if (line.startsWith('Then')) type = 'Then';
      else if (line.startsWith('And')) type = 'And';
      else if (line.startsWith('Scenario')) continue; // Ignorar líneas de Scenario
      else if (line.startsWith('@')) continue; // Ignorar tags
      else continue; // Ignorar líneas vacías o no reconocidas
      
      parsedSteps.push({
        id: `step-${parsedSteps.length}`,
        type,
        content: line.replace(/^(Given|When|Then|And)\s+/, ''),
      });
    }
    
    setSteps(parsedSteps);
    setTags(testCase.tags || []);
    
    // Configurar Examples si se encontraron
    if (foundExamples && headerRow.length > 0) {
      setShowExamples(true);
      setExamples(headerRow);
      setExamplesValues(examplesValues);
      
      // También podríamos guardar los valores para futuras mejoras
      console.log('Examples headers:', headerRow);
      console.log('Examples values:', examplesValues);
    } else {
      setShowExamples(false);
      setExamples(['field']);
      setExamplesValues([]);
    }
    
    loadAvailableSteps();
    // release sync flag after state applied
    setTimeout(() => { isSyncingRef.current = false; }, 0);
  }, [projectId, testCase.testCaseId, testCase.scenario]);

  const loadAvailableSteps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api'}/projects/${projectId}/test-cases/step-templates/organized`);
      if (response.ok) {
        const result = await response.json();
        console.log('Available steps response:', result);
        
        // Extraer los datos de la respuesta anidada
        if (result.success && result.data) {
          setAvailableSteps(result.data);
        } else {
          console.error('Invalid response format:', result);
        }
      } else {
        console.error('Failed to load available steps:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading available steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = (type: 'Given' | 'When' | 'Then' | 'And', content: string = '') => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      type,
      content,
    };
    const next = [...steps, newStep];
    setSteps(next);
  };

  const removeStep = (stepId: string) => {
    const next = steps.filter(step => step.id !== stepId);
    setSteps(next);
  };

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    const next = steps.map(step => step.id === stepId ? { ...step, ...updates } : step);
    setSteps(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  // Función auxiliar para encontrar el último índice de un tipo de step
  const findLastIndex = (steps: Step[], type: string): number => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].type === type) {
        return i;
      }
    }
    return -1;
  };

  // Función para insertar step en la posición correcta según su tipo
  const insertStepInCorrectPosition = (stepTemplate: AvailableStep) => {
    setSteps(prev => {
      const newSteps = [...prev];
      
      // Determinar el tipo correcto del step
      let stepType: 'Given' | 'When' | 'Then' | 'And' = stepTemplate.type;
      
      // Verificar si ya existe un step del mismo tipo en el escenario
      const existingStepOfType = newSteps.find(step => step.type === stepTemplate.type);
      if (existingStepOfType) {
        // Si ya existe un step del mismo tipo, usar "And"
        stepType = 'And';
      }
      
      // Detectar parámetros en la definición del step (usar name en lugar de definition)
      const parameters = extractParameters(stepTemplate.name);
      const initialParameters: Record<string, string> = {};
      
      // Inicializar parámetros con valores vacíos
      parameters.forEach(param => {
        initialParameters[param] = '';
      });
      
      const newStep: Step = {
        id: `step-${Date.now()}`,
        type: stepType,
        content: stepTemplate.name,
        parameters: Object.keys(initialParameters).length > 0 ? initialParameters : undefined,
        originalDefinition: stepTemplate.name, // Usar name en lugar de definition
      };
      
      // Encontrar la posición correcta según el tipo original del template
      let insertIndex = 0;
      
      if (stepTemplate.type === 'Given') {
        // Buscar el último Given o insertar al inicio si no hay Given
        const lastGivenIndex = findLastIndex(newSteps, 'Given');
        insertIndex = lastGivenIndex !== -1 ? lastGivenIndex + 1 : 0;
      } else if (stepTemplate.type === 'When') {
        // Buscar el último When o insertar después del último Given
        const lastWhenIndex = findLastIndex(newSteps, 'When');
        const lastGivenIndex = findLastIndex(newSteps, 'Given');
        insertIndex = lastWhenIndex !== -1 ? lastWhenIndex + 1 : (lastGivenIndex !== -1 ? lastGivenIndex + 1 : 0);
      } else if (stepTemplate.type === 'Then') {
        // Buscar el último Then o insertar al final
        const lastThenIndex = findLastIndex(newSteps, 'Then');
        insertIndex = lastThenIndex !== -1 ? lastThenIndex + 1 : newSteps.length;
      }
      
      newSteps.splice(insertIndex, 0, newStep);
      return newSteps;
    });
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleDropdown = (stepType: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepType)) {
        newSet.delete(stepType);
      } else {
        newSet.add(stepType);
      }
      return newSet;
    });
  };

  const updateStepSearchTerm = (stepType: string, term: string) => {
    setStepSearchTerms(prev => ({
      ...prev,
      [stepType]: term
    }));
  };

  const insertStepFromTemplate = (stepTemplate: AvailableStep) => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      type: stepTemplate.type,
      content: stepTemplate.name, // Usar el nombre en lugar de la definición para mostrar algo más legible
    };
    const next = [...steps, newStep];
    setSteps(next);
  };

  const handleSave = () => {
    // Generar el contenido del escenario con parámetros reemplazados
    const processedSteps = steps.map(step => {
      let stepContent = step.content;
      
      // Si el step tiene parámetros y definición original, reemplazar los parámetros
      if (step.parameters && step.originalDefinition) {
        stepContent = replaceParameters(step.originalDefinition, step.parameters);
      }
      
      return {
        ...step,
        content: stepContent // Actualizar el contenido con parámetros reemplazados
      };
    });
    
    const scenarioText = processedSteps.map(step => `${step.type} ${step.content}`).join('\n');
    
    // Generar Examples con valores reales
    let finalScenario = scenarioText;
    if (showExamples && examples.length > 0) {
      // Usar los valores editados de examplesValues
      const dataRows = examplesValues.length > 0 
        ? examplesValues 
        : [examples.map(field => field)]; // Usar los nombres como valores por defecto
      
      // Generar las filas de datos
      const dataRowsText = dataRows.map(row => `  | ${row.join(' | ')} |`).join('\n');
      
      finalScenario = `${scenarioText}\n\nExamples:\n  | ${examples.join(' | ')} |\n${dataRowsText}`;
    }
    
    // Pasar el escenario completo (incluyendo Examples) al backend
    onSave(processedSteps, tags, finalScenario);
  };

  // Emit changes to parent component
  useEffect(() => {
    if (isSyncingRef.current) return; // Don't emit during initialization
    if (!onChange) return;
    
    // Process steps to replace parameters in content
    const processedSteps = steps.map(step => ({
      ...step,
      content: step.parameters ? replaceParameters(step.content, step.parameters) : step.content,
    }));
    
    // Build final scenario text
    let finalScenario = '';
    
    // Add steps
    processedSteps.forEach(step => {
      finalScenario += `${step.type} ${step.content}\n`;
    });
    
    // Add Examples if enabled
    if (showExamples && examples.length > 0) {
      finalScenario += '\nExamples:\n';
      
      // Add header row
      finalScenario += `| ${examples.join(' | ')} |\n`;
      
      // Add data rows
      examplesValues.forEach(row => {
        finalScenario += `| ${row.join(' | ')} |\n`;
      });
    }
    
    onChange(processedSteps, tags, finalScenario);
  }, [steps, tags, showExamples, examples, examplesValues, onChange]);

  const filteredSteps = (type: 'Given' | 'When' | 'Then') => {
    if (!availableSteps) {
      console.log('No available steps loaded yet');
      return { common: [], entity: [] };
    }
    
    const steps = availableSteps[type];
    if (!steps) {
      console.log(`No steps found for type: ${type}`, availableSteps);
      return { common: [], entity: [] };
    }
    
    console.log(`Steps for ${type}:`, steps);
    
    const searchTerm = stepSearchTerms[type] || '';
    if (!searchTerm) return steps;
    
    const filterStep = (step: AvailableStep) => 
      step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    return {
      common: steps.common?.filter(filterStep) || [],
      entity: steps.entity?.filter(filterStep) || [],
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Left Column - Current Scenario Steps */}
          <div className="col-span-3 space-y-3">
            <div>
              <Label className="text-sm font-medium">Current scenario steps</Label>
            </div>

            {/* Scenario Steps List */}
            <div className="space-y-1 flex-1 overflow-y-auto">
              <SortableContext items={steps.map(step => step.id)} strategy={verticalListSortingStrategy}>
                {steps.map((step, index) => (
                  <SortableStep
                    key={step.id}
                    step={step}
                    onRemove={removeStep}
                    steps={steps}
                    index={index}
                    onUpdateStep={updateStep}
                  />
                ))}
              </SortableContext>
              

            </div>

            {/* Examples Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showExamples"
                  checked={showExamples}
                  onChange={(e) => setShowExamples(e.target.checked)}
                />
                <Label htmlFor="showExamples" className="text-sm">Include Examples</Label>
              </div>
              
              {showExamples && (
                <div className="space-y-1 p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Examples</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Agregar nueva columna
                        const newFieldName = `field${examples.length + 1}`;
                        setExamples([...examples, newFieldName]);
                        
                        // Agregar valor vacío para la nueva columna en todas las filas existentes
                        if (examplesValues.length > 0) {
                          const updatedValues = examplesValues.map(row => [...row, '']);
                          setExamplesValues(updatedValues);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  
                  {/* Tabla de Examples */}
                  <div className="space-y-2">
                    {/* Headers */}
                    <div className="flex gap-2">
                      {examples.map((field, index) => (
                        <div key={index} className="flex-1">
                          <Input
                            value={field}
                            onChange={(e) => {
                              const newExamples = [...examples];
                              newExamples[index] = e.target.value;
                              setExamples(newExamples);
                            }}
                            placeholder="Field name"
                            className="text-xs"
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Eliminar la última columna
                          const newExamples = examples.filter((_, i) => i !== examples.length - 1);
                          setExamples(newExamples);
                          
                          // Eliminar el valor correspondiente de todas las filas
                          if (examplesValues.length > 0) {
                            const updatedValues = examplesValues.map(row => 
                              row.filter((_, i) => i !== row.length - 1)
                            );
                            setExamplesValues(updatedValues);
                          }
                        }}
                        className="px-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Valores de Examples */}
                    {examplesValues.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Values:</Label>
                        {examplesValues.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex gap-2">
                            {row.map((value, colIndex) => (
                              <div key={colIndex} className="flex-1">
                                <Input
                                  value={value}
                                  onChange={(e) => {
                                    const newValues = [...examplesValues];
                                    newValues[rowIndex][colIndex] = e.target.value;
                                    setExamplesValues(newValues);
                                  }}
                                  placeholder="Value"
                                  className="text-xs"
                                />
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newValues = examplesValues.filter((_, i) => i !== rowIndex);
                                setExamplesValues(newValues);
                              }}
                              className="px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Crear una nueva fila con valores vacíos para todas las columnas existentes
                            const newRow = examples.map(() => '');
                            setExamplesValues([...examplesValues, newRow]);
                          }}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Row
                        </Button>
                      </div>
                    )}
                    
                    {/* Si no hay valores pero sí headers, mostrar botón para agregar primera fila */}
                    {examplesValues.length === 0 && examples.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Values:</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Crear la primera fila con valores vacíos para todas las columnas
                            const newRow = examples.map(() => '');
                            setExamplesValues([newRow]);
                          }}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add First Row
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Available Steps */}
          <div className="col-span-2 space-y-3">
            {/* Tags Section */}
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  placeholder="Add tag..."
                  className="w-24"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tagValue = e.currentTarget.value.trim();
                      if (tagValue) {
                        const tagWithAt = tagValue.startsWith('@') ? tagValue : `@${tagValue}`;
                        addTag(tagWithAt);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const tagValue = input.value.trim();
                      const tagWithAt = tagValue.startsWith('@') ? tagValue : `@${tagValue}`;
                      addTag(tagWithAt);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                {tags.length > 0 && (
                  <div className="flex items-center gap-1 ml-1">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Available Steps</Label>
            </div>

            {/* Available Steps Dropdowns */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="text-sm text-muted-foreground">Loading available steps...</div>
                </div>
              ) : (
                (['Given', 'When', 'Then'] as const).map((stepType) => {
                  const filtered = filteredSteps(stepType);
                  const allSteps = [...(filtered.common || []), ...(filtered.entity || [])];
                  const isOpen = openDropdowns.has(stepType);
                  const searchTerm = stepSearchTerms[stepType] || '';
                  
                  return (
                    <div key={stepType} className="border rounded-lg">
                      {/* Dropdown Header with Search */}
                      <div className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{stepType}</span>
                          <span className="text-xs text-muted-foreground">({allSteps.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Search Input */}
                          <div className="relative w-36">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={`Search ${stepType.toLowerCase()} steps...`}
                              value={searchTerm}
                              onChange={(e) => updateStepSearchTerm(stepType, e.target.value)}
                              className="pl-8 text-sm h-8"
                            />
                          </div>
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleDropdown(stepType)}
                            className="p-1 hover:bg-muted/50 rounded transition-colors"
                          >
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Dropdown Content */}
                      {isOpen && (
                        <div>
                          {/* Steps List */}
                          <div className="max-h-48 overflow-y-auto">
                            {allSteps.length > 0 ? (
                              <div className="p-1 space-y-1">
                                {allSteps.map((step) => (
                                  <ClickableAvailableStep
                                    key={step.id}
                                    step={step}
                                    onAdd={insertStepInCorrectPosition}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="p-2 text-xs text-muted-foreground text-center">
                                {searchTerm ? 'No steps match your search' : `No ${stepType.toLowerCase()} steps available`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Save/Cancel Buttons - Siempre al final */}
      <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Scenario'}
        </Button>
      </div>
    </div>
  );
} 