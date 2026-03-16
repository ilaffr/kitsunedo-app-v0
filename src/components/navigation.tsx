import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Home, Trophy, BarChart3 } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "道", fullLabel: "Home", icon: Home },
  { id: "learn", label: "学", fullLabel: "Learn", icon: BookOpen },
  { id: "practice", label: "練", fullLabel: "Practice", icon: GraduationCap },
  { id: "stats", label: "績", fullLabel: "Stats", icon: BarChart3 },
  { id: "achievements", label: "栄", fullLabel: "Rewards", icon: Trophy },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navigate = useNavigate();
  
  const handleTabChange = (id: string) => {
    if (id === "stats") {
      navigate("/stats");
      return;
    }
    if (id === "achievements") {
      navigate("/bestiary");
      return;
    }
    onTabChange(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-sm border-t-2 border-border md:relative md:border-t-0 md:border-r-2 md:h-screen md:w-20">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-1 h-14 md:h-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 p-2 rounded-sm transition-all duration-200 min-w-[52px] md:w-14 md:h-14",
                isActive 
                  ? "text-primary bg-primary/10 border-l-2 md:border-l-0 md:border-r-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-japanese md:hidden",
                isActive ? "font-bold" : "font-normal"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
