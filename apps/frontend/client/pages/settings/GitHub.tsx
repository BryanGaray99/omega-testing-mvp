import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Github,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  GitBranch,
  Users,
  Lock,
} from "lucide-react";

interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  connected: boolean;
  lastSync: string;
  branch: string;
}

export default function GitHubSettings() {
  const [isConnected, setIsConnected] = useState(true);
  const [githubUsername, setGithubUsername] = useState("johndoe");
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("hourly");
  const [isLoading, setIsLoading] = useState(false);

  const [repositories] = useState<GitHubRepo[]>([
    {
      id: "1",
      name: "test-automation-suite",
      fullName: "johndoe/test-automation-suite",
      private: false,
      connected: true,
      lastSync: "2 hours ago",
      branch: "main",
    },
    {
      id: "2",
      name: "api-testing-framework",
      fullName: "johndoe/api-testing-framework",
      private: true,
      connected: true,
      lastSync: "1 day ago",
      branch: "develop",
    },
  ]);

  const handleConnect = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setGithubUsername("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          GitHub Integration
        </h2>
        <p className="text-muted-foreground">
          Connect your GitHub repositories to sync test cases and manage version
          control.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>GitHub Connection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Connected to GitHub</p>
                      <p className="text-sm text-muted-foreground">
                        Connected as @{githubUsername}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-error" />
                    <div>
                      <p className="font-medium">Not connected</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your GitHub account to get started
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                {isConnected ? (
                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={isLoading}>
                    <Github className="h-4 w-4 mr-2" />
                    {isLoading ? "Connecting..." : "Connect GitHub"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Access Token */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Access Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">GitHub Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={personalAccessToken}
                  onChange={(e) => setPersonalAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for private repositories. Token needs `repo` and
                  `workflow` scopes.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sync Settings */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-sync repositories</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync test cases with connected repositories
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              {autoSync && (
                <div className="space-y-2">
                  <Label>Sync Interval</Label>
                  <Select value={syncInterval} onValueChange={setSyncInterval}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Connected Repositories */}
        {isConnected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Connected Repositories</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{repo.name}</span>
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <GitBranch className="h-3 w-3" />
                          <span>{repo.branch}</span>
                        </div>
                        <span>Last sync: {repo.lastSync}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={repo.connected ? "default" : "secondary"}>
                        {repo.connected ? "Connected" : "Disconnected"}
                      </Badge>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
