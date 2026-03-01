import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const CONFIRMATION_TEXT = "RESET ALL DATA";
const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

export default function DangerZoneSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (resetConfirmation !== CONFIRMATION_TEXT) return;

    setIsResetting(true);
    try {
      const response = await fetch(`${API_BASE}/data/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: CONFIRMATION_TEXT }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = result?.message || result?.data?.message || t("dangerZone.toastError");
        toast.error(message);
        return;
      }

      toast.success(t("dangerZone.toastSuccess"));
      setIsResetDialogOpen(false);
      setResetConfirmation("");

      // Invalidate all relevant queries so the UI refetches
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      await queryClient.invalidateQueries({ queryKey: ["testCases"] });
      await queryClient.invalidateQueries({ queryKey: ["testSuites"] });
      await queryClient.invalidateQueries({ queryKey: ["bugs"] });
      await queryClient.invalidateQueries({ queryKey: ["testExecutions"] });
      await queryClient.invalidateQueries({ queryKey: ["global-execution-summary"] });
    } catch (err) {
      toast.error(t("dangerZone.toastNetwork"));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("dangerZone.title")}</h2>
        <p className="text-muted-foreground">
          {t("dangerZone.description")}
        </p>
      </div>

      <Card className="border-destructive/50 dark:border-red-500/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive dark:text-red-400">
            <RefreshCw className="h-5 w-5" />
            <span>{t("dangerZone.resetAll")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("dangerZone.resetWarning")}
          </p>
          <div className="p-3 bg-destructive/10 dark:bg-red-500/20 rounded-lg border border-transparent dark:border-red-500/30">
            <div className="flex space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive dark:text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs text-destructive dark:text-red-300">
                <p className="font-medium">{t("dangerZone.warningTitle")}</p>
                <p>{t("dangerZone.warningBody")}</p>
              </div>
            </div>
          </div>

          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("dangerZone.resetAll")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2 text-destructive dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{t("dangerZone.resetAll")}</span>
                </DialogTitle>
                <DialogDescription>
                  {t("dangerZone.dialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-confirmation">
                    {t("dangerZone.confirmType")}
                  </Label>
                  <Input
                    id="reset-confirmation"
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    placeholder={CONFIRMATION_TEXT}
                    className="font-mono"
                  />
                </div>
                <div className="p-3 bg-destructive/10 dark:bg-red-500/20 rounded-lg">
                  <p className="text-xs text-destructive dark:text-red-300">
                    {t("dangerZone.dialogWarning")}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetDialogOpen(false);
                    setResetConfirmation("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                  onClick={handleResetData}
                  disabled={resetConfirmation !== CONFIRMATION_TEXT || isResetting}
                >
                  {isResetting ? t("dangerZone.resetting") : t("dangerZone.resetAll")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
