import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "golden" | "cherry" | "jade";
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border",
  golden: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30",
  cherry: "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30",
  jade: "bg-gradient-to-br from-success/20 to-success/5 border-success/30",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  golden: "bg-primary/20 text-primary",
  cherry: "bg-accent/20 text-accent",
  jade: "bg-success/20 text-success",
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
        "card-interactive p-4 md:p-5 flex items-center gap-3 md:gap-4 border",
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center",
          iconStyles[variant]
        )}
      >
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div>
        <p className="text-xs md:text-sm font-medium text-muted-foreground">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-bold text-foreground">{value}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
