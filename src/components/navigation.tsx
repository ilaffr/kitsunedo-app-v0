import { cn } from "@/lib/utils";
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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border md:relative md:border-t-0 md:border-r md:h-screen md:w-[72px]">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 h-16 md:h-auto px-2 md:px-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[48px] md:w-12 md:h-12",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-all",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-japanese md:hidden",
                isActive ? "font-bold text-primary" : "font-normal"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="hidden md:block w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
