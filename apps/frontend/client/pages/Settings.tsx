import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bot,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');

  const handleBack = () => {
    navigate(-1);
  };

  // Verificar automáticamente el estado de OpenAI al cargar el componente
  const checkOpenAIStatus = async () => {
    setIsInitialLoading(true);
    setConnectionStatus('checking');
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
      const response = await fetch(`${API_BASE}/ai/check-status`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 OpenAI Status Response:', result); // Debug temporal
        const data = result.data || result; // Manejar tanto la respuesta envuelta como directa
        console.log('🔍 Processed Data:', data); // Debug temporal
        
        if (data.success && data.connected) {
          setIsConnected(true);
          setConnectionStatus('connected');
          // Si hay una API key configurada, mostrarla (parcialmente oculta)
          if (data.configured) {
            setApiKey('sk-***' + '***'.repeat(10)); // Mostrar formato parcial
          }
        } else {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          if (data.configured && !data.connected) {
            setConnectionStatus('error');
          }
        }
      } else {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Verificar estado al montar el componente
  useEffect(() => {
    checkOpenAIStatus();
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Por favor ingresa una API key primero");
      return;
    }

    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
      const response = await fetch(`${API_BASE}/ai/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result; // Manejar tanto la respuesta envuelta como directa
        setIsConnected(true);
        toast.success("Conexión exitosa con OpenAI");
      } else {
        const error = await response.json();
        const errorData = error.data || error; // Manejar tanto la respuesta envuelta como directa
        setIsConnected(false);
        toast.error(errorData.message || error.message || "Error al conectar con OpenAI");
      }
    } catch (error) {
      setIsConnected(false);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Por favor ingresa una API key");
      return;
    }

    setIsSaving(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
      const response = await fetch(`${API_BASE}/ai/save-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        toast.success("API key guardada exitosamente");
        // Verificar el estado después de guardar
        await checkOpenAIStatus();
      } else {
        const error = await response.json();
        const errorData = error.data || error; // Manejar tanto la respuesta envuelta como directa
        toast.error(errorData.message || error.message || "Error al guardar la API key");
      }
    } catch (error) {
      toast.error("Error al guardar la API key");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-8">
              <SettingsIcon className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
            
            {/* Back Button */}
            <Button variant="ghost" className="w-full justify-start mb-6" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Navigation Menu - Only OpenAI */}
            <nav className="space-y-2">
              <Button 
                variant="default" 
                className="w-full justify-start bg-blue-500 hover:bg-blue-700 text-white"
              >
                <Bot className="h-4 w-4 mr-3" />
                OpenAI Configuration
              </Button>
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Platform Settings
            </h2>
          </div>

          {/* OpenAI Configuration */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                OpenAI Configuration
              </h2>
              <p className="text-muted-foreground mb-6">
                Configure AI-powered features for intelligent test generation and
                analysis.
              </p>

              <div className="grid gap-6">
                {/* Connection Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>OpenAI Connection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isInitialLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <div>
                              <p className="font-medium">Verificando conexión...</p>
                              <p className="text-sm text-muted-foreground">
                                Revisando archivo .env y probando conexión
                              </p>
                            </div>
                          </>
                        ) : isConnected ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Connected to OpenAI</p>
                              <p className="text-sm text-muted-foreground">
                                API key is valid and working
                              </p>
                            </div>
                          </>
                        ) : connectionStatus === 'error' ? (
                          <>
                            <XCircle className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-medium">API key configurada pero con error</p>
                              <p className="text-sm text-muted-foreground">
                                La API key existe pero hay un problema de conexión
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium">Not connected</p>
                              <p className="text-sm text-muted-foreground">
                                Please configure your API key and test the connection
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={checkOpenAIStatus}
                          disabled={isInitialLoading}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isInitialLoading ? "Checking..." : "Refresh Status"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleTestConnection}
                          disabled={isLoading || !apiKey.trim()}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {isLoading ? "Testing..." : "Test Connection"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* API Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">OpenAI API Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="apiKey"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={isConnected ? "API key configurada y funcionando" : "sk-..."}
                          disabled={isConnected && apiKey.startsWith('sk-***')}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                          disabled={isConnected && apiKey.startsWith('sk-***')}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {isConnected && apiKey.startsWith('sk-***') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setApiKey('');
                              setIsConnected(false);
                              setConnectionStatus('disconnected');
                            }}
                            title="Limpiar API key"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get your API key from{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          OpenAI Platform
                        </a>
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveApiKey}
                        disabled={isSaving || !apiKey.trim() || (isConnected && apiKey.startsWith('sk-***'))}
                        className="flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : (isConnected && apiKey.startsWith('sk-***') ? "API Key Already Saved" : "Save API Key")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
