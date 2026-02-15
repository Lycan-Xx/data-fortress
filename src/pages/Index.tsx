import { useState, useCallback } from "react";
import TabNav from "@/components/TabNav";
import VaultTable from "@/components/VaultTable";
import PasswordGenerator from "@/components/PasswordGenerator";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";

const Index = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [breachCount, setBreachCount] = useState(0);

  const handleBreachCountChange = useCallback((count: number) => {
    setBreachCount(count);
  }, []);

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return <VaultTable onBreachCountChange={handleBreachCountChange} />;
      case 1:
        return <PasswordGenerator />;
      case 2:
        return <PasswordStrengthChecker />;
      default:
        return <VaultTable onBreachCountChange={handleBreachCountChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TabNav currentTab={currentTab} onTabChange={setCurrentTab} breachCount={breachCount} />
      <main className="flex-1 transition-all duration-300">
        {renderCurrentTab()}
      </main>
      
      <footer className="border-t border-terminal-border bg-terminal-bg mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-2">
            <div className="flex items-center space-x-4">
              <span className="text-primary pulse-glow">◉</span>
              <span>SecureVault v2.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Encrypted · Private · AES-256-GCM</span>
              <span className="text-success animate-glow-pulse">●</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
