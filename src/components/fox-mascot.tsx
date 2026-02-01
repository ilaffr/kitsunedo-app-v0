import foxMascot from "@/assets/fox-mascot.png";
import { cn } from "@/lib/utils";

interface FoxMascotProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function FoxMascot({ 
  size = "md", 
  message, 
  className,
  animate = true 
}: FoxMascotProps) {
  return (
    <div className={cn("relative flex items-end gap-3", className)}>
      <img 
        src={foxMascot} 
        alt="Kitsune guide" 
        className={cn(
          sizeClasses[size],
          "object-contain drop-shadow-lg",
          animate && "animate-float"
        )}
      />
      {message && (
        <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs border border-primary/20 shadow-glow">
          <p className="text-sm text-foreground">{message}</p>
          <div className="absolute -bottom-1 left-0 w-3 h-3 bg-card/90 border-l border-b border-primary/20 transform -skew-x-12" />
        </div>
      )}
    </div>
  );
}
