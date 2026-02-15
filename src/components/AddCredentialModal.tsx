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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, RefreshCw, Copy, Settings } from "lucide-react";

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

interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
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
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [generatorOptions, setGeneratorOptions] = useState<GeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });
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
    let charset = "";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const similar = "il1Lo0O";

    if (generatorOptions.includeLowercase) charset += lowercase;
    if (generatorOptions.includeUppercase) charset += uppercase;
    if (generatorOptions.includeNumbers) charset += numbers;
    if (generatorOptions.includeSymbols) charset += symbols;

    if (generatorOptions.excludeSimilar) {
      charset = charset.split("").filter((char) => !similar.includes(char)).join("");
    }

    if (charset === "") {
      toast({
        title: "Invalid Options",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    let result = "";
    for (let i = 0; i < generatorOptions.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(result);
  };

  const useGeneratedPassword = () => {
    if (generatedPassword) {
      setPassword(generatedPassword);
      setShowGenerator(false);
      toast({ title: "Password applied", description: "Generated password has been set" });
    }
  };

  const copyGeneratedPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({ title: "Copied!", description: "Password copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
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

  const strengthScore = getStrengthScore(password || generatedPassword);
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-muted", "bg-error", "bg-error", "bg-warning", "bg-warning", "bg-success", "bg-primary"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPassword = password || generatedPassword;
    if (!siteName.trim() || !username.trim() || !finalPassword.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    onSubmit({
      id: editData?.id,
      site_name: siteName.trim(),
      site_url: siteUrl.trim(),
      username: username.trim(),
      password: finalPassword,
    });
    setGeneratedPassword("");
    onOpenChange(false);
  };

  const PasswordGeneratorDialog = () => (
    <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
      <DialogContent className="bg-card border-terminal-border terminal-glow sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Password Generator
          </DialogTitle>
          <DialogDescription>
            Customize your password specifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">
              Password Length: {generatorOptions.length}
              <span className="text-xs text-muted-foreground ml-2">
                ({generatorOptions.length < 12 ? "Vulnerable" : generatorOptions.length < 16 ? "Good" : "Excellent"})
              </span>
            </Label>
            <Slider
              value={[generatorOptions.length]}
              onValueChange={(value) => setGeneratorOptions({ ...generatorOptions, length: value[0] })}
              max={64}
              min={8}
              step={1}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={generatorOptions.includeUppercase}
                onCheckedChange={(checked) =>
                  setGeneratorOptions({ ...generatorOptions, includeUppercase: checked as boolean })
                }
              />
              <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={generatorOptions.includeLowercase}
                onCheckedChange={(checked) =>
                  setGeneratorOptions({ ...generatorOptions, includeLowercase: checked as boolean })
                }
              />
              <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={generatorOptions.includeNumbers}
                onCheckedChange={(checked) =>
                  setGeneratorOptions({ ...generatorOptions, includeNumbers: checked as boolean })
                }
              />
              <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={generatorOptions.includeSymbols}
                onCheckedChange={(checked) =>
                  setGeneratorOptions({ ...generatorOptions, includeSymbols: checked as boolean })
                }
              />
              <Label htmlFor="symbols" className="text-sm">Symbols (!@#$)</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exclude-similar"
              checked={generatorOptions.excludeSimilar}
              onCheckedChange={(checked) =>
                setGeneratorOptions({ ...generatorOptions, excludeSimilar: checked as boolean })
              }
            />
            <Label htmlFor="exclude-similar" className="text-sm">
              Exclude similar (i, l, 1, L, o, 0, O)
            </Label>
          </div>

          <Button
            onClick={generatePassword}
            className="w-full terminal-glow"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </Button>

          {generatedPassword && (
            <Card className="border-terminal-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-primary">Generated Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm break-all">
                    {generatedPassword}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={copyGeneratedPassword}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Security Level:</span>
                    <span>{strengthLabels[strengthScore]}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${strengthColors[strengthScore]} h-2 rounded-full transition-all`}
                      style={{ width: `${(strengthScore / 6) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-secondary rounded p-2">
                    <div className="font-bold text-primary">{generatedPassword.length}</div>
                    <div className="text-muted-foreground">Chars</div>
                  </div>
                  <div className="bg-secondary rounded p-2">
                    <div className="font-bold text-accent">
                      {Math.floor(Math.log2(Math.pow(85, generatedPassword.length)))}
                    </div>
                    <div className="text-muted-foreground">Entropy</div>
                  </div>
                  <div className="bg-secondary rounded p-2">
                    <div className="font-bold text-success">10¹⁶⁺</div>
                    <div className="text-muted-foreground">Crack Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerator(false)}>
              Cancel
            </Button>
            <Button
              onClick={useGeneratedPassword}
              disabled={!generatedPassword}
              className="terminal-glow"
            >
              Use This Password
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-terminal-border terminal-glow sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                  onClick={() => {
                    generatePassword();
                    setShowGenerator(true);
                  }}
                  className="terminal-glow shrink-0"
                  title="Open password generator"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {(password || generatedPassword) && (
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

      <PasswordGeneratorDialog />
    </>
  );
};

export default AddCredentialModal;
