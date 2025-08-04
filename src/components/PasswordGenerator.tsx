import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Zap, Shield, Lock } from "lucide-react";

interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  });
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = "";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const similar = "il1Lo0O";

    if (options.includeLowercase) charset += lowercase;
    if (options.includeUppercase) charset += uppercase;
    if (options.includeNumbers) charset += numbers;
    if (options.includeSymbols) charset += symbols;

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !similar.includes(char)).join('');
    }

    if (charset === "") {
      toast({
        title: "Invalid Options",
        description: "Please select at least one character type",
        variant: "destructive"
      });
      return;
    }

    let result = "";
    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(result);
  };

  const copyPassword = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy password to clipboard",
        variant: "destructive"
      });
    }
  };

  const getStrengthIndicator = () => {
    if (!password) return { strength: 0, color: "bg-muted", text: "" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const indicators = [
      { strength: 0, color: "bg-muted", text: "" },
      { strength: 1, color: "bg-error", text: "Very Weak" },
      { strength: 2, color: "bg-error", text: "Weak" },
      { strength: 3, color: "bg-warning", text: "Fair" },
      { strength: 4, color: "bg-warning", text: "Good" },
      { strength: 5, color: "bg-success", text: "Strong" },
      { strength: 6, color: "bg-primary", text: "Very Strong" }
    ];

    return indicators[score];
  };

  const strengthIndicator = getStrengthIndicator();

  useEffect(() => {
    // Listen for navigation events from other components
    const handleSwitchToTab = () => {
      // Auto-generate a password when navigated here from breach detection
      generatePassword();
    };

    window.addEventListener('switchToTab', handleSwitchToTab);
    return () => window.removeEventListener('switchToTab', handleSwitchToTab);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      {/* Story Section */}
      <div className="text-center mb-8 slide-up">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-primary animate-float" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-glow mb-4">Password Forge</h1>
        <div className="bg-card border border-terminal-border rounded-lg p-6 mb-6 terminal-glow">
          <h2 className="text-lg font-semibold text-accent mb-3">Your Digital Weapon Against Cyber Threats</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            In the digital arms race, your password is your primary weapon. Weak passwords are like paper shields 
            against artillery—they offer no real protection. Every character adds exponential strength to your defense. 
            Generate passwords so complex that even quantum computers would need centuries to crack them.
          </p>
        </div>
      </div>

      <Card className="terminal-glow mb-6 game-notification">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Password Configuration
          </CardTitle>
          <CardDescription>
            Customize your digital armor specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Password Length: {options.length}
              <span className="text-xs text-muted-foreground">
                ({options.length < 12 ? 'Vulnerable' : options.length < 16 ? 'Good' : 'Excellent'})
              </span>
            </Label>
            <Slider
              value={[options.length]}
              onValueChange={(value) => setOptions({ ...options, length: value[0] })}
              max={128}
              min={4}
              step={1}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeUppercase: checked as boolean })
                }
              />
              <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeLowercase: checked as boolean })
                }
              />
              <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeNumbers: checked as boolean })
                }
              />
              <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeSymbols: checked as boolean })
                }
              />
              <Label htmlFor="symbols" className="text-sm">Symbols (!@#$)</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exclude-similar"
              checked={options.excludeSimilar}
              onCheckedChange={(checked) => 
                setOptions({ ...options, excludeSimilar: checked as boolean })
              }
            />
            <Label htmlFor="exclude-similar" className="text-sm">
              Exclude similar characters (i, l, 1, L, o, 0, O)
            </Label>
          </div>

          <Button 
            onClick={generatePassword}
            className="w-full terminal-glow transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Forge New Password
          </Button>
        </CardContent>
      </Card>

      {password && (
        <Card className="terminal-glow slide-up">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Generated Password
            </CardTitle>
            <CardDescription>
              Your digital fortress key is ready
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <div className="p-4 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm sm:text-lg break-all terminal-glow overflow-x-auto">
                  {password}
                </div>
                <Button
                  onClick={copyPassword}
                  size="sm"
                  className="absolute top-2 right-2 terminal-glow transition-all duration-300 hover:scale-110"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Security Level:</span>
                  <span className="text-sm font-medium">{strengthIndicator.text}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`${strengthIndicator.color} h-3 rounded-full transition-all duration-500 animate-glow-pulse`}
                    style={{ width: `${(strengthIndicator.strength / 6) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-lg font-bold text-primary">{password.length}</div>
                  <div className="text-xs text-muted-foreground">Characters</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-lg font-bold text-accent">
                    {Math.floor(Math.log2(Math.pow(85, password.length)))}
                  </div>
                  <div className="text-xs text-muted-foreground">Entropy Bits</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-lg font-bold text-success">10¹⁶⁺</div>
                  <div className="text-xs text-muted-foreground">Years to Crack</div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-accent">Security Recommendations:</p>
                  <p>• Store in a password manager immediately</p>
                  <p>• Use unique passwords for every account</p>
                  <p>• Enable 2FA wherever possible</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PasswordGenerator;