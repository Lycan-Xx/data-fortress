import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-glow mb-2">📊 Strength Analyzer</h1>
        <p className="text-muted-foreground">Real-time password security analysis</p>
      </div>

      <Card className="terminal-glow mb-6">
        <CardHeader>
          <CardTitle className="text-primary">Password Analysis</CardTitle>
          <CardDescription>
            Enter a password to analyze its security strength
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
                className="terminal-glow bg-input border-terminal-border pr-20"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {analysis && password && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Strength:</span>
                    <span className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
                      {getScoreText(analysis.score)}
                    </span>
                  </div>
                  <Progress 
                    value={(analysis.score / 4) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Length:</span>
                    <span className="ml-2">{analysis.length} characters</span>
                  </div>
                  <div>
                    <span className="font-medium">Crack Time:</span>
                    <span className="ml-2">{analysis.crackTime}</span>
                  </div>
                  <div>
                    <span className="font-medium">Entropy:</span>
                    <span className="ml-2">{Math.floor(analysis.entropy)} bits</span>
                  </div>
                  <div>
                    <span className="font-medium">Score:</span>
                    <span className="ml-2">{analysis.score}/4</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && password && (
        <>
          <Card className="terminal-glow mb-6">
            <CardHeader>
              <CardTitle className="text-primary">Character Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lowercase (a-z)</span>
                  <Badge variant={analysis.hasLowercase ? "default" : "outline"}>
                    {analysis.hasLowercase ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uppercase (A-Z)</span>
                  <Badge variant={analysis.hasUppercase ? "default" : "outline"}>
                    {analysis.hasUppercase ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Numbers (0-9)</span>
                  <Badge variant={analysis.hasNumbers ? "default" : "outline"}>
                    {analysis.hasNumbers ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Symbols (!@#$)</span>
                  <Badge variant={analysis.hasSymbols ? "default" : "outline"}>
                    {analysis.hasSymbols ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.feedback.length > 0 && (
            <Card className="terminal-glow">
              <CardHeader>
                <CardTitle className="text-warning">💡 Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.feedback.map((tip, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-warning mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthChecker;