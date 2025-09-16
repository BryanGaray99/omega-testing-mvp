import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Edit,
  Shield,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface APIToken {
  id: string;
  name: string;
  token: string;
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

const availableScopes = [
  {
    id: "read:projects",
    name: "Read Projects",
    description: "View project data",
  },
  {
    id: "write:projects",
    name: "Write Projects",
    description: "Create and modify projects",
  },
  {
    id: "read:tests",
    name: "Read Tests",
    description: "View test cases and results",
  },
  {
    id: "write:tests",
    name: "Write Tests",
    description: "Create and modify test cases",
  },
  {
    id: "execute:tests",
    name: "Execute Tests",
    description: "Run test executions",
  },
  {
    id: "read:reports",
    name: "Read Reports",
    description: "Access test reports and analytics",
  },
  {
    id: "admin",
    name: "Admin Access",
    description: "Full administrative access",
  },
];

export default function TokensSettings() {
  const [tokens, setTokens] = useState<APIToken[]>([
    {
      id: "1",
      name: "CI/CD Pipeline",
      token: "tc_1234567890abcdef...",
      scopes: ["read:tests", "execute:tests", "read:reports"],
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
      expiresAt: "2025-01-15",
      isActive: true,
    },
    {
      id: "2",
      name: "Development Environment",
      token: "tc_abcdef1234567890...",
      scopes: ["read:projects", "write:projects", "read:tests", "write:tests"],
      createdAt: "2024-01-10",
      lastUsed: "1 day ago",
      isActive: true,
    },
    {
      id: "3",
      name: "External Integration",
      token: "tc_fedcba0987654321...",
      scopes: ["read:reports"],
      createdAt: "2023-12-01",
      lastUsed: "Never",
      expiresAt: "2024-12-01",
      isActive: false,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState({
    name: "",
    scopes: [] as string[],
    expiresAt: "",
  });
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());

  const handleCreateToken = () => {
    const token: APIToken = {
      id: Date.now().toString(),
      name: newToken.name,
      token: `tc_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      scopes: newToken.scopes,
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
      ...(newToken.expiresAt && { expiresAt: newToken.expiresAt }),
    };

    setTokens([token, ...tokens]);
    setNewToken({ name: "", scopes: [], expiresAt: "" });
    setIsCreateDialogOpen(false);
  };

  const handleToggleReveal = (tokenId: string) => {
    const newRevealed = new Set(revealedTokens);
    if (newRevealed.has(tokenId)) {
      newRevealed.delete(tokenId);
    } else {
      newRevealed.add(tokenId);
    }
    setRevealedTokens(newRevealed);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    // Show toast notification
  };

  const handleDeleteToken = (tokenId: string) => {
    setTokens(tokens.filter((t) => t.id !== tokenId));
  };

  const handleToggleScope = (scope: string) => {
    const newScopes = newToken.scopes.includes(scope)
      ? newToken.scopes.filter((s) => s !== scope)
      : [...newToken.scopes, scope];
    setNewToken({ ...newToken, scopes: newScopes });
  };

  const getScopeColor = (scope: string) => {
    if (scope === "admin") return "destructive";
    if (scope.startsWith("write:") || scope.startsWith("execute:"))
      return "default";
    return "secondary";
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isTokenExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry < thirtyDaysFromNow && expiry > new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          API Keys & Tokens
        </h2>
        <p className="text-muted-foreground">
          Manage API tokens for programmatic access to Omega Testing.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Create Token */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Tokens</span>
              </CardTitle>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Token
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New API Token</DialogTitle>
                    <DialogDescription>
                      Generate a new API token with specific permissions for
                      external integrations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-name">Token Name</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., CI/CD Pipeline"
                        value={newToken.name}
                        onChange={(e) =>
                          setNewToken({ ...newToken, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires-at">
                        Expiration Date (Optional)
                      </Label>
                      <Input
                        id="expires-at"
                        type="date"
                        value={newToken.expiresAt}
                        onChange={(e) =>
                          setNewToken({
                            ...newToken,
                            expiresAt: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      {availableScopes.map((scope) => (
                        <div
                          key={scope.id}
                          className="flex items-start space-x-3"
                        >
                          <Checkbox
                            id={scope.id}
                            checked={newToken.scopes.includes(scope.id)}
                            onCheckedChange={() => handleToggleScope(scope.id)}
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor={scope.id}
                              className="text-sm font-medium"
                            >
                              {scope.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {scope.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateToken}
                      disabled={!newToken.name || newToken.scopes.length === 0}
                    >
                      Create Token
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokens.map((token) => (
                <Card key={token.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{token.name}</span>
                          <div className="flex items-center space-x-2">
                            {!token.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {isTokenExpired(token.expiresAt) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                            {isTokenExpiringSoon(token.expiresAt) && (
                              <Badge variant="outline" className="text-warning">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {revealedTokens.has(token.id)
                              ? token.token
                              : `${token.token.substring(0, 8)}${"*".repeat(20)}`}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleReveal(token.id)}
                          >
                            {revealedTokens.has(token.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToken(token.token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {token.scopes.map((scope) => (
                            <Badge
                              key={scope}
                              variant={getScopeColor(scope) as any}
                              className="text-xs"
                            >
                              {availableScopes.find((s) => s.id === scope)
                                ?.name || scope}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {token.createdAt}</span>
                          </div>
                          {token.lastUsed && (
                            <span>Last used: {token.lastUsed}</span>
                          )}
                          {token.expiresAt && (
                            <span>Expires: {token.expiresAt}</span>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Token
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Token
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteToken(token.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Token
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <Shield className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Security Best Practices</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    • Store tokens securely and never commit them to version
                    control
                  </li>
                  <li>• Use tokens with the minimum required permissions</li>
                  <li>• Rotate tokens regularly and set expiration dates</li>
                  <li>• Monitor token usage and revoke unused tokens</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
