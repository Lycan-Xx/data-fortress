import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface TabNavProps {
  currentTab: number;
  onTabChange: (index: number) => void;
}

const TabNav = ({ currentTab, onTabChange }: TabNavProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const tabs = [
    { 
      name: "Breach Guardian", 
      shortName: "Scanner",
      description: "Scan for data breaches",
      story: "In the digital battlefield, knowledge is your shield"
    },
    { 
      name: "Password Forge", 
      shortName: "Generator",
      description: "Forge unbreakable passwords",
      story: "Craft weapons that guard your digital fortress"
    },
    { 
      name: "Strength Analyzer", 
      shortName: "Analyzer",
      description: "Analyze password strength",
      story: "Test your defenses before the enemy strikes"
    }
  ];

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentTab < tabs.length - 1) {
      onTabChange(currentTab + 1);
    }
    if (isRightSwipe && currentTab > 0) {
      onTabChange(currentTab - 1);
    }
  };

  return (
    <nav className="border-b border-terminal-border bg-terminal-bg overflow-hidden">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center space-x-1 p-4">
          {tabs.map((tab, index) => (
            <Button
              key={index}
              variant={currentTab === index ? "default" : "ghost"}
              onClick={() => onTabChange(index)}
              className={`
                transition-glow font-mono text-sm group relative
                ${currentTab === index 
                  ? "bg-primary text-primary-foreground terminal-glow animate-glow-pulse" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg">{tab.name}</span>
                <span className="text-xs opacity-70">{tab.description}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Mobile Card Stack */}
        <div 
          className="md:hidden relative h-32 p-4 card-stack"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {tabs.map((tab, index) => {
            const offset = index - currentTab;
            const isActive = index === currentTab;
            const isPrevious = index < currentTab;
            const isNext = index > currentTab;

            return (
              <div
                key={index}
                className={`
                  absolute inset-x-4 top-4 bottom-4 
                  bg-card border border-terminal-border rounded-lg
                  transition-all duration-500 ease-out
                  ${isActive ? 'z-30 terminal-glow' : 'z-10'}
                  ${isPrevious ? '-translate-x-full opacity-30' : ''}
                  ${isNext ? 'translate-x-full opacity-30' : ''}
                  ${isActive ? 'translate-x-0 opacity-100' : ''}
                `}
                style={{
                  transform: `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.9})`,
                }}
                onClick={() => onTabChange(index)}
              >
                <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                  <h3 className="text-lg font-bold text-primary mb-1">{tab.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{tab.description}</p>
                  <p className="text-xs text-accent italic">{tab.story}</p>
                </div>
              </div>
            );
          })}
          
          {/* Swipe indicators */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTab ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TabNav;