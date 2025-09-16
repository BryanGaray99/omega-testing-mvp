export interface Endpoint {
  endpointId: string;
  name: string;
  path: string;
  section: string;
  entityName: string;
  projectId: string;
  projectName?: string;
  methods: EndpointMethod[];
  status: "pending" | "analyzing" | "generating" | "ready" | "failed";
  createdAt: string;
  updatedAt?: string;
  description?: string;
  generatedArtifacts?: GeneratedArtifacts;
  analysisResults?: AnalysisResults;
}

export interface GeneratedArtifacts {
  feature?: string;
  steps?: string;
  fixture?: string;
  schema?: string;
  types?: string;
  client?: string;
}

export interface AnalysisResults {
  [method: string]: {
    statusCode?: number;
    responseFields?: ResponseField[];
    contentType?: string;
  };
}

export interface ResponseField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: any;
}

export interface EndpointMethod {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requestBodyDefinition?: FieldDefinition[];
  description?: string;
  requiresAuth: boolean;
}

export interface FieldDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  example?: any;
  validations?: Record<string, any>;
  required?: boolean;
  description?: string;
}

export interface CreateEndpointData {
  name: string;
  path: string;
  section: string;
  entityName: string;
  methods: EndpointMethod[];
  description?: string;
}

export interface UpdateEndpointData {
  name?: string;
  path?: string;
  section?: string;
  entityName?: string;
  methods?: EndpointMethod[];
  description?: string;
} 