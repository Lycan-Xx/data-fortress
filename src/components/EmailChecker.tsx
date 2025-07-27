import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-glow mb-2">🛡️ Breach Guardian</h1>
        <p className="text-muted-foreground">Check if your email appears in known data breaches</p>
      </div>

      <Card className="terminal-glow mb-6">
        <CardHeader>
          <CardTitle className="text-primary">Email Security Scan</CardTitle>
          <CardDescription>
            Enter your email to check against known data breaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="terminal-glow bg-input border-terminal-border"
              onKeyPress={(e) => e.key === 'Enter' && checkBreaches()}
            />
            <Button 
              onClick={checkBreaches} 
              disabled={loading}
              className="terminal-glow"
            >
              {loading ? "Scanning..." : "Check Breaches"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {checked && (
        <Card className="terminal-glow">
          <CardHeader>
            <CardTitle className={breaches.length > 0 ? "text-error" : "text-success"}>
              {breaches.length > 0 ? "⚠️ Breaches Detected" : "✅ No Breaches Found"}
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
                  <div key={index} className="p-4 rounded-lg bg-secondary border border-terminal-border">
                    <div className="flex justify-between items-start mb-2">
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
                  <h4 className="font-semibold text-warning mb-2">🚨 Recommended Actions:</h4>
                  <ul className="text-sm space-y-1 text-warning/90">
                    <li>• Change passwords for affected accounts immediately</li>
                    <li>• Enable two-factor authentication (2FA) where possible</li>
                    <li>• Use a password manager to generate unique passwords</li>
                    <li>• Monitor accounts for suspicious activity</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-success">Your email appears to be secure!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Continue practicing good security hygiene
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailChecker;