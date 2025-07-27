import { useState } from "react";
import TabNav from "@/components/TabNav";
import EmailChecker from "@/components/EmailChecker";
import PasswordGenerator from "@/components/PasswordGenerator";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";

const Index = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return <EmailChecker />;
      case 1:
        return <PasswordGenerator />;
      case 2:
        return <PasswordStrengthChecker />;
      default:
        return <EmailChecker />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TabNav currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="transition-all duration-300">
        {renderCurrentTab()}
      </main>
      
      {/* Terminal-style footer */}
      <footer className="border-t border-terminal-border bg-terminal-bg mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="text-primary">◉</span>
              <span>CyberSec Toolkit v1.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Secure • Private • Open Source</span>
              <span className="text-success">●</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;