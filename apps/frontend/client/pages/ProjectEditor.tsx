import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  Play,
  Settings,
  FileText,
  Code,
  Database,
  Globe,
  Plus,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  Bug,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Replace,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ProjectFile {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: ProjectFile[];
  modified?: boolean;
}

interface Project {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  status: "pending" | "ready" | "failed";
  endpoints: number;
  testCases: number;
  lastRun: string;
  createdAt: string;
  description?: string;
  configuration?: {
    timeout: number;
    retries: number;
    headers: Record<string, string>;
    environment: string;
  };
}

const mockProject: Project = {
  id: "1",
  name: "ecommerce-api",
  displayName: "E-commerce Platform API",
  baseUrl: "https://api.ecommerce.com",
  status: "ready",
  endpoints: 24,
  testCases: 156,
  lastRun: "2 hours ago",
  createdAt: "2024-01-15",
  description: "Main e-commerce platform API testing suite",
  configuration: {
    timeout: 5000,
    retries: 3,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {{token}}",
    },
    environment: "staging",
  },
};

const mockProjectFiles: ProjectFile[] = [
  {
    id: "1",
    name: "tests",
    type: "folder",
    path: "/tests",
    children: [
      {
        id: "2",
        name: "auth",
        type: "folder",
        path: "/tests/auth",
        children: [
          {
            id: "3",
            name: "login.test.js",
            type: "file",
            path: "/tests/auth/login.test.js",
            language: "javascript",
            content: `// Login API Tests
describe('Login API', () => {
  const baseUrl = 'https://api.ecommerce.com';
  
  test('should login with valid credentials', async () => {
    const response = await fetch(\`\${baseUrl}/auth/login\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('user@example.com');
  });
  
  test('should reject invalid credentials', async () => {
    const response = await fetch(\`\${baseUrl}/auth/login\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid credentials');
  });
});`,
          },
          {
            id: "4",
            name: "register.test.js",
            type: "file",
            path: "/tests/auth/register.test.js",
            language: "javascript",
            content: `// Registration API Tests
describe('Registration API', () => {
  const baseUrl = 'https://api.ecommerce.com';
  
  test('should register new user', async () => {
    const response = await fetch(\`\${baseUrl}/auth/register\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.email).toBe('newuser@example.com');
    expect(data.user.name).toBe('New User');
  });
});`,
          },
        ],
      },
      {
        id: "5",
        name: "products",
        type: "folder",
        path: "/tests/products",
        children: [
          {
            id: "6",
            name: "products.test.js",
            type: "file",
            path: "/tests/products/products.test.js",
            language: "javascript",
            content: `// Products API Tests
describe('Products API', () => {
  const baseUrl = 'https://api.ecommerce.com';
  let authToken;
  
  beforeAll(async () => {
    // Get authentication token
    const authResponse = await fetch(\`\${baseUrl}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    const authData = await authResponse.json();
    authToken = authData.token;
  });
  
  test('should get all products', async () => {
    const response = await fetch(\`\${baseUrl}/products\`, {
      headers: {
        'Authorization': \`Bearer \${authToken}\`
      }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.products)).toBe(true);
  });
  
  test('should create new product', async () => {
    const newProduct = {
      name: 'Test Product',
      price: 99.99,
      description: 'A test product',
      category: 'electronics'
    };
    
    const response = await fetch(\`\${baseUrl}/products\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${authToken}\`
      },
      body: JSON.stringify(newProduct)
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.product.name).toBe(newProduct.name);
  });
});`,
          },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "config",
    type: "folder",
    path: "/config",
    children: [
      {
        id: "8",
        name: "environment.json",
        type: "file",
        path: "/config/environment.json",
        language: "json",
        content: `{
  "development": {
    "baseUrl": "http://localhost:3000",
    "timeout": 5000,
    "retries": 1
  },
  "staging": {
    "baseUrl": "https://staging-api.ecommerce.com",
    "timeout": 10000,
    "retries": 3
  },
  "production": {
    "baseUrl": "https://api.ecommerce.com",
    "timeout": 15000,
    "retries": 5
  }
}`,
      },
      {
        id: "9",
        name: "setup.js",
        type: "file",
        path: "/config/setup.js",
        language: "javascript",
        content: `// Test Setup Configuration
const { beforeAll, afterAll } = require('@jest/globals');

beforeAll(async () => {
  console.log('Setting up test environment...');
  
  // Initialize database connection
  await setupDatabase();
  
  // Setup test data
  await seedTestData();
  
  console.log('Test environment ready!');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  
  // Clean up test data
  await cleanupTestData();
  
  // Close database connection
  await closeDatabaseConnection();
  
  console.log('Test cleanup complete!');
});

async function setupDatabase() {
  // Database setup logic
}

async function seedTestData() {
  // Test data seeding logic
}

async function cleanupTestData() {
  // Test data cleanup logic
}

async function closeDatabaseConnection() {
  // Database connection cleanup
}`,
      },
    ],
  },
  {
    id: "10",
    name: "README.md",
    type: "file",
    path: "/README.md",
    language: "markdown",
    content: `# E-commerce Platform API Tests

This project contains comprehensive API tests for the e-commerce platform.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

## Test Structure

- \`tests/auth/\` - Authentication related tests
- \`tests/products/\` - Product management tests
- \`tests/orders/\` - Order processing tests
- \`config/\` - Test configuration files

## Environment Configuration

The tests support multiple environments:
- Development (\`http://localhost:3000\`)
- Staging (\`https://staging-api.ecommerce.com\`)
- Production (\`https://api.ecommerce.com\`)

## Contributing

1. Create a new branch for your feature
2. Write tests following the existing patterns
3. Ensure all tests pass
4. Submit a pull request
`,
  },
];

export default function ProjectEditor() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>(mockProjectFiles);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["1", "2", "5", "7"]),
  );
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchReplace, setShowSearchReplace] = useState(false);

  useEffect(() => {
    // In a real app, fetch project data based on ID
    setProject(mockProject);
    // Set first file as active
    const firstFile = findFirstFile(mockProjectFiles);
    if (firstFile) {
      setActiveFile(firstFile);
    }
  }, [id]);

  const findFirstFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.type === "file") {
        return file;
      }
      if (file.children) {
        const found = findFirstFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (files: ProjectFile[], depth = 0) => {
    return files.map((file) => (
      <div key={file.id}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded text-sm ${
            activeFile?.id === file.id ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (file.type === "folder") {
              toggleFolder(file.id);
            } else {
              setActiveFile(file);
            }
          }}
        >
          {file.type === "folder" ? (
            <>
              {expandedFolders.has(file.id) ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 mr-2 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-4 mr-1" />
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{file.name}</span>
          {file.modified && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto" />
          )}
        </div>
        {file.type === "folder" &&
          expandedFolders.has(file.id) &&
          file.children && (
            <div>{renderFileTree(file.children, depth + 1)}</div>
          )}
      </div>
    ));
  };

  const getLanguageColor = (language?: string) => {
    const colors: Record<string, string> = {
      javascript: "text-yellow-600",
      json: "text-green-600",
      markdown: "text-blue-600",
      html: "text-orange-600",
      css: "text-purple-600",
    };
    return colors[language || ""] || "text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              {getStatusIcon(project.status)}
              <div>
                <h1 className="text-xl font-semibold">{project.displayName}</h1>
                <p className="text-sm text-muted-foreground">
                  {project.name} • {project.baseUrl}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync with Git
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Terminal className="mr-2 h-4 w-4" />
                  Open Terminal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <div className="border-b px-6">
            <TabsList className="h-10">
              <TabsTrigger value="editor" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 m-0">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* File Explorer */}
              <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                <div className="h-full border-r bg-muted/20">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">Explorer</h3>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        className="pl-7 h-7 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="p-2 overflow-auto max-h-full">
                    {renderFileTree(files)}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Code Editor */}
              <ResizablePanel defaultSize={75}>
                <div className="h-full flex flex-col">
                  {/* Editor Header */}
                  {activeFile && (
                    <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {activeFile.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getLanguageColor(
                            activeFile.language,
                          )}`}
                        >
                          {activeFile.language || "text"}
                        </Badge>
                        {activeFile.modified && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowSearchReplace(!showSearchReplace)
                          }
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMaximized(!isMaximized)}
                        >
                          {isMaximized ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Path
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}

                  {/* Search/Replace Bar */}
                  {showSearchReplace && (
                    <div className="border-b bg-muted/50 p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input placeholder="Find" className="flex-1 h-8" />
                        <Button variant="outline" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input placeholder="Replace" className="flex-1 h-8" />
                        <Button variant="outline" size="sm">
                          <Replace className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Code Content */}
                  <div className="flex-1 bg-background">
                    {activeFile ? (
                      <div className="h-full relative">
                        <pre className="h-full p-4 overflow-auto font-mono text-sm leading-relaxed">
                          <code className="language-javascript">
                            {activeFile.content}
                          </code>
                        </pre>
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                          Lines: {activeFile.content?.split("\n").length || 0} |
                          Characters: {activeFile.content?.length || 0}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Select a file to start editing</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>

          <TabsContent value="config" className="flex-1 m-0 p-6">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeout">Timeout (ms)</Label>
                      <Input
                        id="timeout"
                        value={project.configuration?.timeout || 5000}
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="retries">Retries</Label>
                      <Input
                        id="retries"
                        value={project.configuration?.retries || 3}
                        type="number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select defaultValue={project.configuration?.environment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Headers</Label>
                    <Textarea
                      placeholder="JSON format headers..."
                      value={JSON.stringify(
                        project.configuration?.headers || {},
                        null,
                        2,
                      )}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="flex-1 m-0 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      🚧 Database integration will be implemented in future
                      versions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="flex-1 m-0 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Project Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">
                      {files.find((f) => f.name === "README.md")?.content ||
                        "No documentation available."}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
