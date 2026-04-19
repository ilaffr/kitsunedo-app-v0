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
  ink: { stroke: "hsl(30, 8%, 12%)", bg: "hsl(30, 12%, 82%)" },
  vermillion: { stroke: "hsl(5, 78%, 42%)", bg: "hsl(5, 30%, 88%)" },
  bamboo: { stroke: "hsl(150, 35%, 35%)", bg: "hsl(150, 20%, 88%)" },
};

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 6,
  className,
  children,
  variant = "ink",
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth - 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;
  const colors = variantColors[variant];

  // Ink blob at the leading edge of the arc (in SVG coords, before -rotate-90)
  const blobAngle = (clampedProgress / 100) * 2 * Math.PI;
  const blobX = cx + radius * Math.cos(blobAngle);
  const blobY = cy + radius * Math.sin(blobAngle);
  const blobRadius = (strokeWidth + 1) / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Ghost track — thinner, low contrast */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth - 1}
          strokeLinecap="round"
        />
        {/* Progress arc — heavier, ink character */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        {/* Ensō ink blob at the arc tip */}
        {clampedProgress > 2 && clampedProgress < 100 && (
          <circle
            cx={blobX}
            cy={blobY}
            r={blobRadius}
            fill={colors.stroke}
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
