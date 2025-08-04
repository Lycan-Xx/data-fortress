import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Zap, AlertTriangle } from "lucide-react";

interface Breach {
  Name: string;
  Domain: string;
  BreachDate: string;
  Description: string;
  DataClasses: string[];
}

const EmailChecker = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkBreaches = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setChecked(false);

    try {
      // Note: In a real implementation, this would go through a backend
      // For demo purposes, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated breach data
      const mockBreaches: Breach[] = [
        {
          Name: "Adobe",
          Domain: "adobe.com",
          BreachDate: "2013-10-04",
          Description: "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.",
          DataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"]
        }
      ];

      setBreaches(mockBreaches);
      setChecked(true);

      if (mockBreaches.length > 0) {
        toast({
          title: "Breaches Found",
          description: `Found ${mockBreaches.length} breach(es) for this email`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Breaches Found",
          description: "This email wasn't found in any known breaches",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check breaches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToPasswordGenerator = () => {
    // This would typically use React Router navigation
    // For now, we'll use the parent's tab change function
    // In a real app, you'd pass this function down or use context/routing
    window.dispatchEvent(new CustomEvent('switchToTab', { detail: 1 }));
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Story Section */}
      <div className="text-center mb-8 slide-up">
        <div className="flex justify-center mb-4">
          <Shield className="w-12 h-12 text-primary animate-float" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-glow mb-4">Breach Guardian</h1>
        <div className="bg-card border border-terminal-border rounded-lg p-6 mb-6 terminal-glow">
          <h2 className="text-lg font-semibold text-accent mb-3">Why Regular Breach Monitoring Matters</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every 39 seconds, a cyber attack occurs. Data breaches expose billions of credentials annually, 
            leaving digital footprints that criminals exploit for years. Your email might already be compromised 
            without your knowledge. Regular monitoring isn't paranoia—it's digital survival in an age where 
            your identity is your most valuable asset.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-warning">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Last major breach exposed 3.2B accounts</span>
          </div>
        </div>
      </div>

      <Card className="terminal-glow mb-6 game-notification">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Email Security Scan
          </CardTitle>
          <CardDescription>
            Enter your email to scan against our database of known breaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="terminal-glow bg-input border-terminal-border flex-1"
              onKeyPress={(e) => e.key === 'Enter' && checkBreaches()}
            />
            <Button 
              onClick={checkBreaches} 
              disabled={loading}
              className="terminal-glow transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Scanning...
                </div>
              ) : (
                "Initiate Scan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {checked && (
        <Card className="terminal-glow slide-up">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${breaches.length > 0 ? "text-error" : "text-success"}`}>
              {breaches.length > 0 ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  ⚠️ Breaches Detected
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  No Breaches Found
                </>
              )}
            </CardTitle>
            <CardDescription>
              {breaches.length > 0 
                ? `Found ${breaches.length} breach(es) associated with this email`
                : "This email wasn't found in any known data breaches"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {breaches.length > 0 ? (
              <div className="space-y-4">
                {breaches.map((breach, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary border border-terminal-border animate-slide-in">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                      <h3 className="font-semibold text-lg">{breach.Name}</h3>
                      <Badge variant="destructive">{breach.BreachDate}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{breach.Description}</p>
                    <div>
                      <p className="text-sm font-medium mb-2">Compromised Data:</p>
                      <div className="flex flex-wrap gap-1">
                        {breach.DataClasses.map((dataClass, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {dataClass}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Actions Required:
                  </h4>
                  <ul className="text-sm space-y-1 text-warning/90 mb-4">
                    <li>• Change passwords for affected accounts immediately</li>
                    <li>• Enable two-factor authentication (2FA) where possible</li>
                    <li>• Use a password manager to generate unique passwords</li>
                    <li>• Monitor accounts for suspicious activity</li>
                  </ul>
                  <Button 
                    onClick={navigateToPasswordGenerator}
                    className="w-full bg-warning text-warning-foreground hover:bg-warning/90 terminal-glow transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Secure Passwords Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-success mx-auto mb-4 animate-float" />
                <p className="text-success text-lg font-semibold">Your email appears to be secure!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Continue practicing good security hygiene
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Next scan recommended in 30 days
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailChecker;