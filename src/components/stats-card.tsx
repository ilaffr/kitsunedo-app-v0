import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "primary" | "success" | "accent";
  className?: string;
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-gradient-primary text-primary-foreground",
  success: "bg-gradient-success text-success-foreground",
  accent: "bg-gradient-accent text-accent-foreground",
};

const iconBgStyles = {
  default: "bg-muted",
  primary: "bg-primary-foreground/20",
  success: "bg-success-foreground/20",
  accent: "bg-accent-foreground/20",
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
        "card-interactive p-5 flex items-center gap-4",
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconBgStyles[variant]
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={cn(
          "text-sm font-medium",
          variant === "default" ? "text-muted-foreground" : "opacity-80"
        )}>
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
        {sublabel && (
          <p className={cn(
            "text-xs",
            variant === "default" ? "text-muted-foreground" : "opacity-70"
          )}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
