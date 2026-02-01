import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, Home, Trophy, BarChart3 } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "practice", label: "Practice", icon: GraduationCap },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:relative md:border-t-0 md:border-r md:h-screen md:w-20">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 h-16 md:h-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px] md:w-14 md:h-14",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium md:hidden">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
