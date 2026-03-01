import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
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
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

export default function OpenAISettings() {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Al cargar: comprobar si ya hay API key configurada en el backend
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      setIsInitialLoading(true);
      try {
        const res = await fetch(`${API_BASE}/ai/check-status`);
        if (cancelled) return;
        if (res.ok) {
          const result = await res.json();
          const data = result.data ?? result;
          if (data?.configured && data?.connected) {
            setIsConnected(true);
            setApiKey("sk-***" + "***".repeat(10));
          } else if (data?.configured) {
            setIsConnected(false);
            setApiKey("sk-***" + "***".repeat(10));
          }
        }
      } catch {
        if (!cancelled) setIsConnected(false);
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error(t("openai.toastEnterKey"));
      return;
    }

    setIsLoading(true);
    try {
      // Si la clave ya está guardada (enmascarada), el backend prueba la del .env vía check-status
      if (apiKey.startsWith("sk-***")) {
        const res = await fetch(`${API_BASE}/ai/check-status`);
        if (res.ok) {
          const result = await res.json();
          const data = result.data ?? result;
          if (data?.connected) {
            setIsConnected(true);
            toast.success(t("openai.toastSuccess"));
          } else {
            setIsConnected(false);
            toast.error(data?.message || t("openai.toastErrorConnect"));
          }
        } else {
          setIsConnected(false);
          toast.error(t("openai.toastConnectionError"));
        }
        return;
      }

      const response = await fetch(`${API_BASE}/ai/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsConnected(true);
        toast.success(t("openai.toastSuccess"));
      } else {
        const err = await response.json();
        setIsConnected(false);
        toast.error(err?.message || t("openai.toastErrorConnect"));
      }
    } catch {
      setIsConnected(false);
      toast.error(t("openai.toastConnectionError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t("openai.toastKeyRequired"));
      return;
    }
    if (apiKey.startsWith("sk-***")) {
      toast.error(t("openai.toastKeyAlreadySaved"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/ai/save-api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        toast.success(t("openai.toastSaveSuccess"));
        setIsConnected(true);
        setApiKey("sk-***" + "***".repeat(10));
      } else {
        const err = await response.json();
        toast.error(err?.message || t("openai.toastErrorSave"));
      }
    } catch {
      toast.error(t("openai.toastErrorSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const clearSavedKey = () => {
    setApiKey("");
    setIsConnected(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("openai.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("openai.description")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>{t("openai.connection")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isInitialLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">{t("openai.checkingStatus")}</p>
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t("openai.connected")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("openai.apiKeyValid")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">{t("openai.notConnected")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("openai.configureAndTest")}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading || isInitialLoading || !apiKey.trim()}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? t("openai.testing") : t("openai.testConnection")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t("openai.apiConfig")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t("openai.apiKeyLabel")}</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={apiKey.startsWith("sk-***") ? t("openai.placeholderSaved") : t("openai.placeholder")}
                  disabled={apiKey.startsWith("sk-***")}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={apiKey.startsWith("sk-***")}
                  title={showApiKey ? t("openai.hide") : t("openai.show")}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {apiKey.startsWith("sk-***") && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearSavedKey}
                    title={t("openai.clearKey")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("openai.getKeyFrom")}{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline dark:text-[#60A5FA] dark:hover:text-[#93C5FD]"
                >
                  {t("openai.platform")}
                </a>
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveApiKey}
                disabled={isSaving || !apiKey.trim() || apiKey.startsWith("sk-***")}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t("openai.saving") : apiKey.startsWith("sk-***") ? t("openai.keyAlreadySaved") : t("openai.saveKey")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
