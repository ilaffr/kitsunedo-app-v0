import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  variant?: "ink" | "vermillion" | "bamboo";
}

const variantColors = {
  ink: { stroke: "hsl(0, 0%, 15%)", bg: "hsl(0, 0%, 90%)" },
  vermillion: { stroke: "hsl(5, 85%, 45%)", bg: "hsl(5, 30%, 90%)" },
  bamboo: { stroke: "hsl(150, 35%, 35%)", bg: "hsl(150, 20%, 90%)" },
};

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 6,
  className,
  children,
  variant = "ink",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const colors = variantColors[variant];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle - light brush stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress circle - bold ink stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth + 1}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
