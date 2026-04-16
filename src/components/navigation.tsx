import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Home, Trophy, BarChart3 } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "道", fullLabel: "Path", icon: Home },
  { id: "learn", label: "学", fullLabel: "Learn", icon: BookOpen },
  { id: "practice", label: "練", fullLabel: "Practice", icon: GraduationCap },
  { id: "stats", label: "績", fullLabel: "Stats", icon: BarChart3 },
  { id: "achievements", label: "栄", fullLabel: "Honors", icon: Trophy },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navigate = useNavigate();

  const handleTabChange = (id: string) => {
    if (id === "stats") return navigate("/stats");
    if (id === "achievements") return navigate("/bestiary");
    if (id === "practice") return navigate("/practice");
    onTabChange(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md md:relative md:h-screen md:w-24 md:bg-transparent">
      {/* Hairline divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent md:hidden" />
      <div className="hidden md:block absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-10 md:gap-2 h-14 md:h-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors duration-300 min-w-[56px] md:w-20 md:py-4",
                !isActive && "brush-hover hover:text-background",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {/* Brush-stroke active indicator */}
              {isActive && (
                <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-8 -z-10 brush-active opacity-100 md:opacity-90" aria-hidden />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-all relative z-10",
                  isActive ? "text-background md:text-background scale-105" : "group-hover:text-primary"
                )}
              />
              <span
                className={cn(
                  "text-[10px] tracking-[0.2em] uppercase relative z-10 hidden md:block transition-colors",
                  isActive ? "text-background font-medium" : "text-muted-foreground group-hover:text-primary"
                )}
              >
                {item.fullLabel}
              </span>
              <span
                className={cn(
                  "text-xs serif-jp md:hidden relative z-10",
                  isActive ? "text-background font-bold" : "text-muted-foreground group-hover:text-primary"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
