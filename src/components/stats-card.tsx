import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "vermillion" | "ink";
  className?: string;
}

const accentColor = {
  default: "text-foreground/70",
  vermillion: "text-primary",
  ink: "text-foreground",
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  sublabel,
  variant = "default",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "washi-card p-4 md:p-5 flex items-center gap-3 transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className={cn("flex items-center justify-center w-10 h-10 md:w-11 md:h-11", accentColor[variant])}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.25em]">
          {label}
        </p>
        <p className={cn("text-xl md:text-2xl serif-jp font-medium tracking-wide truncate", accentColor[variant])}>
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground tracking-wide">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
