import { Button } from "@/components/ui/button";

interface TabNavProps {
  currentTab: number;
  onTabChange: (index: number) => void;
}

const TabNav = ({ currentTab, onTabChange }: TabNavProps) => {
  const tabs = [
    { name: "Email Checker", icon: "🛡️" },
    { name: "Password Generator", icon: "🔐" },
    { name: "Strength Checker", icon: "📊" }
  ];

  return (
    <nav className="border-b border-terminal-border bg-terminal-bg">
      <div className="container mx-auto">
        <div className="flex justify-center space-x-1 p-4">
          {tabs.map((tab, index) => (
            <Button
              key={index}
              variant={currentTab === index ? "default" : "ghost"}
              onClick={() => onTabChange(index)}
              className={`
                transition-glow font-mono text-sm
                ${currentTab === index 
                  ? "bg-primary text-primary-foreground terminal-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TabNav;