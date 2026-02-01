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

const variantStyles = {
  default: "bg-card border-border",
  vermillion: "bg-primary/5 border-primary/30",
  ink: "bg-accent/5 border-accent/20",
};

const iconStyles = {
  default: "bg-secondary text-foreground",
  vermillion: "bg-primary/15 text-primary",
  ink: "bg-accent/10 text-accent",
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
        "card-interactive p-4 flex items-center gap-3 border-2",
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 md:w-11 md:h-11 rounded-sm flex items-center justify-center",
          iconStyles[variant]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-brush font-bold text-foreground">{value}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
