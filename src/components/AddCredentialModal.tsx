import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Eye, EyeOff, Shield } from "lucide-react";

interface CredentialData {
  id?: number;
  site_name: string;
  site_url: string;
  username: string;
  password: string;
}

interface AddCredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CredentialData) => void;
  editData?: CredentialData | null;
}

const AddCredentialModal = ({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddCredentialModalProps) => {
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editData) {
      setSiteName(editData.site_name);
      setSiteUrl(editData.site_url);
      setUsername(editData.username);
      setPassword(editData.password || "");
    } else {
      setSiteName("");
      setSiteUrl("");
      setUsername("");
      setPassword("");
    }
  }, [editData, open]);

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let result = "";
    for (let i = 0; i < 20; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
    toast({ title: "Password generated", description: "A strong password has been created" });
  };

  const getStrengthScore = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return Math.min(score, 6);
  };

  const strengthScore = getStrengthScore(password);
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-muted", "bg-error", "bg-error", "bg-warning", "bg-warning", "bg-success", "bg-primary"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !username.trim() || !password.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    onSubmit({
      id: editData?.id,
      site_name: siteName.trim(),
      site_url: siteUrl.trim(),
      username: username.trim(),
      password: password,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-terminal-border terminal-glow sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {editData ? "Edit Credential" : "Add Credential"}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? "Update this credential entry in your vault"
              : "Add a new credential to your encrypted vault"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name *</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. GitHub"
              className="bg-input border-terminal-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-url">Site URL</Label>
            <Input
              id="site-url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="e.g. https://github.com"
              className="bg-input border-terminal-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. user@example.com"
              className="bg-input border-terminal-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or generate a password"
                  className="bg-input border-terminal-border pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                className="terminal-glow shrink-0"
                title="Generate password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Strength</span>
                  <span>{strengthLabels[strengthScore]}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`${strengthColors[strengthScore]} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${(strengthScore / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="terminal-glow">
              {editData ? "Update" : "Save to Vault"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredentialModal;
