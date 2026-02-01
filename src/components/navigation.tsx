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
  { id: "achievements", label: "Rewards", icon: Trophy },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:relative md:border-t-0 md:border-r md:h-screen md:w-20">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 h-14 md:h-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 md:gap-1 p-2 rounded-xl transition-all duration-300 min-w-[56px] md:w-14 md:h-14",
                isActive 
                  ? "text-primary bg-primary/15 shadow-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-all",
                isActive && "scale-110 drop-shadow-[0_0_8px_hsl(38,90%,55%,0.5)]"
              )} />
              <span className="text-[10px] md:text-xs font-medium md:hidden">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
