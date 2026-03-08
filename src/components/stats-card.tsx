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
  vermillion: "bg-primary/5 border-primary/15",
  ink: "bg-accent/5 border-accent/10",
};

const iconStyles = {
  default: "bg-muted text-foreground",
  vermillion: "bg-primary/10 text-primary",
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
        "card-interactive p-4 flex items-center gap-3",
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          iconStyles[variant]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-brush font-bold text-foreground leading-tight">{value}</p>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground truncate">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
