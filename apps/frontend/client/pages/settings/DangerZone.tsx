import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  Database,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function DangerZoneSettings() {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [exportData, setExportData] = useState({
    projects: true,
    testCases: true,
    executions: true,
    settings: true,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsExporting(false);
    // Trigger download
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE MY ACCOUNT") return;
    // Simulate account deletion
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleteDialogOpen(false);
    // Redirect to goodbye page
  };

  const handleResetData = async () => {
    if (resetConfirmation !== "RESET ALL DATA") return;
    // Simulate data reset
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsResetDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Danger Zone</h2>
        <p className="text-muted-foreground">
          Irreversible and destructive actions for your account and data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Account Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a complete backup of your account data before making any
              destructive changes.
            </p>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Select data to export:
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-projects"
                    checked={exportData.projects}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, projects: !!checked })
                    }
                  />
                  <Label htmlFor="export-projects" className="text-sm">
                    Projects and configurations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-tests"
                    checked={exportData.testCases}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, testCases: !!checked })
                    }
                  />
                  <Label htmlFor="export-tests" className="text-sm">
                    Test cases and scenarios
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-executions"
                    checked={exportData.executions}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, executions: !!checked })
                    }
                  />
                  <Label htmlFor="export-executions" className="text-sm">
                    Execution history and results
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="export-settings"
                    checked={exportData.settings}
                    onCheckedChange={(checked) =>
                      setExportData({ ...exportData, settings: !!checked })
                    }
                  />
                  <Label htmlFor="export-settings" className="text-sm">
                    Account settings and preferences
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExportData}
              disabled={
                isExporting ||
                !Object.values(exportData).some((selected) => selected)
              }
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Selected Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Reset All Data */}
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-warning">
              <RefreshCw className="h-5 w-5" />
              <span>Reset All Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your projects, test cases,
                execution history, and reset your account to its initial state.
              </p>
              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="flex space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="text-xs text-warning">
                    <p className="font-medium">
                      Warning: This action is irreversible
                    </p>
                    <p>
                      All your data will be permanently deleted and cannot be
                      recovered.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Dialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-warning text-warning hover:bg-warning/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Reset All Data</span>
                  </DialogTitle>
                  <DialogDescription>
                    This action will permanently delete all your data and cannot
                    be undone. Your account will be reset to its initial state.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirmation">
                      Type "RESET ALL DATA" to confirm:
                    </Label>
                    <Input
                      id="reset-confirmation"
                      value={resetConfirmation}
                      onChange={(e) => setResetConfirmation(e.target.value)}
                      placeholder="RESET ALL DATA"
                    />
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-xs text-destructive">
                      This will delete all projects, test cases, execution
                      history, and configurations permanently.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsResetDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleResetData}
                    disabled={resetConfirmation !== "RESET ALL DATA"}
                  >
                    Reset All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>Delete Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Permanently delete your Omega Testing account and all associated
                data. This action cannot be undone.
              </p>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="flex space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="text-xs text-destructive">
                    <p className="font-medium">This will permanently delete:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Your account and profile information</li>
                      <li>• All projects and test configurations</li>
                      <li>• Test cases and execution history</li>
                      <li>• API tokens and integrations</li>
                      <li>• All account settings and preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Delete Account</span>
                  </DialogTitle>
                  <DialogDescription>
                    This action will permanently delete your account and all
                    associated data. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-confirmation">
                      Type "DELETE MY ACCOUNT" to confirm:
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE MY ACCOUNT"
                    />
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="text-xs text-destructive">
                        <p className="font-medium">Final warning:</p>
                        <p>
                          We will immediately delete all your data and close
                          your account. You will not be able to reactivate this
                          account or recover any data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE MY ACCOUNT"}
                  >
                    Delete Account Forever
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Data Retention Notice */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Data Retention Policy</p>
                <p className="text-xs text-muted-foreground">
                  For security and compliance purposes, some metadata may be
                  retained for up to 90 days after account deletion. Personal
                  data and test content are deleted immediately.{" "}
                  <a href="#" className="text-primary hover:underline">
                    Learn more
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
