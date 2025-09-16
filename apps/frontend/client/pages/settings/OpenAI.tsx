import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function OpenAISettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Por favor ingresa una API key primero");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/v1/api/ai/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsConnected(true);
        toast.success("Conexión exitosa con OpenAI");
      } else {
        const error = await response.json();
        setIsConnected(false);
        toast.error(error.message || "Error al conectar con OpenAI");
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
      const response = await fetch('/v1/api/ai/save-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        toast.success("API key guardada exitosamente");
        // Probar la conexión después de guardar
        await handleTestConnection();
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al guardar la API key");
      }
    } catch (error) {
      toast.error("Error al guardar la API key");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          OpenAI Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure AI-powered features for intelligent test generation and
          analysis.
        </p>
      </div>

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
                {isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Connected to OpenAI</p>
                      <p className="text-sm text-muted-foreground">
                        API key is valid and working
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
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading || !apiKey.trim()}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
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
                  placeholder="sk-..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
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
                disabled={isSaving || !apiKey.trim()}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save API Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
