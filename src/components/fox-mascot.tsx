import foxBrush from "@/assets/fox-brush.png";
import { cn } from "@/lib/utils";

interface FoxMascotProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

export function FoxMascot({ 
  size = "md", 
  message, 
  className,
}: FoxMascotProps) {
  return (
    <div className={cn("relative flex items-end gap-4", className)}>
      <img 
        src={foxBrush} 
        alt="Kitsune spirit" 
        className={cn(
          sizeClasses[size],
          "object-contain animate-float"
        )}
      />
      {message && (
        <div className="relative bg-card border-2 border-foreground/20 rounded-sm px-4 py-3 max-w-xs shadow-ink">
          <p className="text-sm text-foreground font-serif">{message}</p>
          {/* Brush stroke accent */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full transform -skew-y-6" />
        </div>
      )}
    </div>
  );
}
