import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Zap, BarChart3, Users, HeadphonesIcon } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Invalid credentials. Try any email like 'test@example.com'.");
    }
  };

  const futureFeatures = [
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Generate test cases with natural language",
    },
    {
      icon: BarChart3,
      title: "Advanced Reports",
      description: "Detailed analytics and insights",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share projects with your team",
    },
    {
      icon: HeadphonesIcon,
      title: "Priority Support",
      description: "Get help when you need it most",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LogIn className="h-5 w-5" />
            <span>Login to Omega Testing</span>
          </DialogTitle>
          <DialogDescription>
            Login to access basic user features and preview future
            implementations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Future Features */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-secondary">
            <h3 className="font-medium text-sm mb-3">
              🚧 Future Implementations (Thesis Project):
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {futureFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 opacity-70"
                >
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Demo Accounts:</strong>
                <br />
                • test@example.com (Any email works)
                <br />• Use any password for demo purposes
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Continue as Guest
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
