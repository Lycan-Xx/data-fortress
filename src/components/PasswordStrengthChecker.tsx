import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, RefreshCw, Target, AlertTriangle, Shield } from "lucide-react";

interface StrengthAnalysis {
  score: number;
  crackTime: string;
  feedback: string[];
  entropy: number;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeats: boolean;
  length: number;
}

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const analyzePassword = (pwd: string): StrengthAnalysis => {
    if (!pwd) {
      return {
        score: 0,
        crackTime: "N/A",
        feedback: [],
        entropy: 0,
        hasLowercase: false,
        hasUppercase: false,
        hasNumbers: false,
        hasSymbols: false,
        hasRepeats: false,
        length: 0
      };
    }

    let score = 0;
    const feedback: string[] = [];
    
    // Character set analysis
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^A-Za-z0-9]/.test(pwd);
    const hasRepeats = /(.)\1{2,}/.test(pwd);

    // Length scoring
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    // Character variety scoring
    if (hasLowercase) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 1;

    // Penalties
    if (hasRepeats) score -= 1;
    if (pwd.length < 8) score -= 2;

    // Normalize score to 0-4 scale
    score = Math.max(0, Math.min(4, score));

    // Generate feedback
    if (pwd.length < 8) feedback.push("Use at least 8 characters");
    if (pwd.length < 12) feedback.push("Consider using 12+ characters for better security");
    if (!hasLowercase) feedback.push("Add lowercase letters");
    if (!hasUppercase) feedback.push("Add uppercase letters");
    if (!hasNumbers) feedback.push("Add numbers");
    if (!hasSymbols) feedback.push("Add symbols for extra security");
    if (hasRepeats) feedback.push("Avoid repeating characters");
    
    // Common patterns check
    if (/123|abc|qwe|password|admin/i.test(pwd)) {
      feedback.push("Avoid common patterns and words");
      score = Math.max(0, score - 1);
    }

    // Calculate entropy
    let charsetSize = 0;
    if (hasLowercase) charsetSize += 26;
    if (hasUppercase) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSymbols) charsetSize += 32;
    
    const entropy = pwd.length * Math.log2(charsetSize);

    // Estimate crack time
    const combinations = Math.pow(charsetSize, pwd.length);
    const secondsToCrack = combinations / (1e9 * 2); // Assume 1 billion guesses/sec, divide by 2 for average
    
    let crackTime = "";
    if (secondsToCrack < 60) crackTime = "< 1 minute";
    else if (secondsToCrack < 3600) crackTime = `${Math.ceil(secondsToCrack / 60)} minutes`;
    else if (secondsToCrack < 86400) crackTime = `${Math.ceil(secondsToCrack / 3600)} hours`;
    else if (secondsToCrack < 31536000) crackTime = `${Math.ceil(secondsToCrack / 86400)} days`;
    else if (secondsToCrack < 31536000000) crackTime = `${Math.ceil(secondsToCrack / 31536000)} years`;
    else crackTime = "centuries";

    return {
      score,
      crackTime,
      feedback,
      entropy,
      hasLowercase,
      hasUppercase,
      hasNumbers,
      hasSymbols,
      hasRepeats,
      length: pwd.length
    };
  };

  useEffect(() => {
    const analysis = analyzePassword(password);
    setAnalysis(analysis);
  }, [password]);

  const getScoreColor = (score: number) => {
    const colors = [
      "text-muted-foreground",
      "text-error",
      "text-warning",
      "text-warning",
      "text-success",
      "text-primary"
    ];
    return colors[score] || colors[0];
  };

  const getScoreText = (score: number) => {
    const texts = ["No Password", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return texts[score] || texts[0];
  };

  const getProgressColor = (score: number) => {
    if (score <= 1) return "bg-error";
    if (score <= 2) return "bg-warning";
    if (score <= 3) return "bg-warning";
    return "bg-success";
  };

  const getScoreIcon = (score: number) => {
    if (score <= 1) return <AlertTriangle className="w-5 h-5" />;
    if (score <= 2) return <AlertTriangle className="w-5 h-5" />;
    if (score <= 3) return <Shield className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const getBadgeVariant = (score: number) => {
    if (score <= 1) return "destructive";
    if (score <= 2) return "outline";
    if (score <= 3) return "secondary";
    return "default";
  };

  const generateSamplePassword = () => {
    const samples = [
      "Password123!",
      "MyStr0ng!Pass",
      "SecureP@ssw0rd2024",
      "Tr0ub4dor&3",
      "C0mpl3x!ty#Rules"
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setPassword(randomSample);
    toast({
      title: "Sample Password Loaded",
      description: "Testing with a sample password",
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      {/* Story Section */}
      <div className="text-center mb-8 slide-up">
        <div className="flex justify-center mb-4">
          <Target className="w-12 h-12 text-primary animate-float" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-glow mb-4">Strength Analyzer</h1>
        <div className="bg-card border border-terminal-border rounded-lg p-6 mb-6 terminal-glow">
          <h2 className="text-lg font-semibold text-accent mb-3">Know Your Digital Defenses</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            In cyber warfare, knowing your weaknesses before your enemies do is survival. This analyzer 
            simulates real-world attack patterns to reveal how long your password would survive against 
            modern cracking techniques. Every second counts when hackers are using quantum-powered attacks.
          </p>
        </div>
      </div>

      <Card className="terminal-glow mb-6 game-notification">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Target className="w-5 h-5" />
            Password Strength Test
          </CardTitle>
          <CardDescription>
            Enter a password to analyze its defensive capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password to analyze..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-glow bg-input border-terminal-border pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
              onClick={generateSamplePassword}
              variant="outline"
              className="w-full terminal-glow transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Test with Sample Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {password && analysis && (
        <Card className="terminal-glow slide-up">
          <CardHeader>
            <CardTitle className={`${getScoreColor(analysis.score)} flex items-center gap-2`}>
              {getScoreIcon(analysis.score)}
              Password Analysis Results
            </CardTitle>
            <CardDescription>
              Comprehensive security assessment of your digital armor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Strength Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Defensive Rating</span>
                  <Badge variant={getBadgeVariant(analysis.score)} className="animate-glow-pulse">
                    {getScoreText(analysis.score)}
                  </Badge>
                </div>
                <Progress 
                  value={(analysis.score / 4) * 100} 
                  className="h-4"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Security Level: {analysis.score}/4
                </div>
              </div>

              {/* Crack Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4 terminal-glow">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <h4 className="font-semibold text-sm">Breach Resistance</h4>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{analysis.crackTime}</p>
                  <p className="text-xs text-muted-foreground">vs. modern attacks</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 terminal-glow">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-accent" />
                    <h4 className="font-semibold text-sm">Password Length</h4>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-accent">{password.length}</p>
                  <p className="text-xs text-muted-foreground">Characters</p>
                </div>
              </div>

              {/* Character Analysis */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Composition Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-2 bg-secondary rounded">
                    <span>Uppercase:</span>
                    <span className={analysis.hasUppercase ? "text-success" : "text-error"}>
                      {analysis.hasUppercase ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary rounded">
                    <span>Lowercase:</span>
                    <span className={analysis.hasLowercase ? "text-success" : "text-error"}>
                      {analysis.hasLowercase ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary rounded">
                    <span>Numbers:</span>
                    <span className={analysis.hasNumbers ? "text-success" : "text-error"}>
                      {analysis.hasNumbers ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary rounded">
                    <span>Symbols:</span>
                    <span className={analysis.hasSymbols ? "text-success" : "text-error"}>
                      {analysis.hasSymbols ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {analysis.feedback && analysis.feedback.length > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-warning flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Security Vulnerabilities Detected
                  </h4>
                  <ul className="space-y-1">
                    {analysis.feedback.map((feedback, index) => (
                      <li key={index} className="text-xs text-warning/90 flex items-start gap-2">
                        <span className="text-warning">•</span>
                        {feedback}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PasswordStrengthChecker;