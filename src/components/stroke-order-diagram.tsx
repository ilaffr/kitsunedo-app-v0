import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrokeOrderDiagramProps {
  kanji: string;
  size?: number;
  className?: string;
}

interface StrokePath {
  d: string;
  id: string;
}

/**
 * Fetches KanjiVG SVG data from GitHub and renders an animated
 * stroke-order diagram with numbered strokes.
 */
export function StrokeOrderDiagram({
  kanji,
  size = 280,
  className,
}: StrokeOrderDiagramProps) {
  const [strokes, setStrokes] = useState<StrokePath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeStroke, setActiveStroke] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch and parse KanjiVG SVG
  useEffect(() => {
    const codePoint = kanji.codePointAt(0);
    if (!codePoint) return;

    const hex = codePoint.toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

    setLoading(true);
    setError(false);
    setStrokes([]);
    resetAnimation();

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        // KanjiVG stores strokes as <path> elements inside groups
        const paths = doc.querySelectorAll("path");
        const parsed: StrokePath[] = [];
        paths.forEach((p, i) => {
          const d = p.getAttribute("d");
          if (d) {
            parsed.push({ d, id: `stroke-${i}` });
          }
        });
        setStrokes(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [kanji]);

  const resetAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveStroke(-1);
    setCompletedStrokes([]);
    setIsPlaying(false);
  }, []);

  const playAnimation = useCallback(() => {
    if (strokes.length === 0) return;
    resetAnimation();
    setIsPlaying(true);

    let current = 0;
    const animateNext = () => {
      if (current >= strokes.length) {
        setIsPlaying(false);
        return;
      }
      setActiveStroke(current);
      timerRef.current = setTimeout(() => {
        setCompletedStrokes((prev) => [...prev, current]);
        current++;
        animateNext();
      }, 800);
    };
    animateNext();
  }, [strokes, resetAnimation]);

  const togglePlay = () => {
    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPlaying(false);
    } else {
      // If already finished, restart
      if (completedStrokes.length === strokes.length) {
        playAnimation();
      } else {
        playAnimation();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Calculate the start point of each stroke for number placement
  const getStrokeStart = (d: string): { x: number; y: number } | null => {
    const match = d.match(/^[Mm]\s*([\d.]+)[,\s]+([\d.]+)/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return null;
  };

  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading strokes…</p>
        </div>
      </div>
    );
  }

  if (error || strokes.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border-2 border-border rounded-sm bg-card",
          className
        )}
        style={{ width: size, height: size }}
      >
        <div className="text-center px-4">
          <p className="text-3xl japanese-text font-bold text-foreground mb-2">
            {kanji}
          </p>
          <p className="text-xs text-muted-foreground">
            Stroke data not available
          </p>
        </div>
      </div>
    );
  }

  // KanjiVG uses a 109x109 viewBox
  const viewBox = "0 0 109 109";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="relative border-2 border-border rounded-sm bg-card overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Grid lines */}
        <svg
          viewBox={viewBox}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <line
            x1="54.5" y1="0" x2="54.5" y2="109"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          <line
            x1="0" y1="54.5" x2="109" y2="54.5"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
        </svg>

        {/* Strokes SVG */}
        <svg viewBox={viewBox} className="absolute inset-0 w-full h-full">
          {strokes.map((stroke, i) => {
            const isCompleted = completedStrokes.includes(i);
            const isActive = activeStroke === i;
            const isVisible = isCompleted || isActive || !isPlaying;

            return (
              <g key={stroke.id}>
                {/* Ghost stroke (light) — always visible */}
                <path
                  d={stroke.d}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isPlaying ? 0.1 : 0.15}
                />

                {/* Active / completed stroke */}
                {isVisible && (
                  <path
                    d={stroke.d}
                    fill="none"
                    stroke={
                      isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--foreground))"
                    }
                    strokeWidth={isActive ? "4" : "3"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isActive ? "animate-stroke-draw" : ""}
                    style={
                      isActive
                        ? {
                            strokeDasharray: 300,
                            strokeDashoffset: 300,
                            animation: "stroke-draw 0.7s ease-out forwards",
                          }
                        : undefined
                    }
                  />
                )}

                {/* Stroke number */}
                {(() => {
                  const start = getStrokeStart(stroke.d);
                  if (!start) return null;
                  const showNumber =
                    !isPlaying ||
                    isCompleted ||
                    isActive;
                  if (!showNumber) return null;
                  return (
                    <g>
                      <circle
                        cx={start.x}
                        cy={start.y}
                        r="5.5"
                        fill={
                          isActive
                            ? "hsl(var(--primary))"
                            : "hsl(var(--foreground))"
                        }
                        opacity={isActive ? 1 : 0.8}
                      />
                      <text
                        x={start.x}
                        y={start.y + 0.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="hsl(var(--background))"
                        fontSize="6"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 border-border rounded-sm
                     hover:border-foreground/30 transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Animate
            </>
          )}
        </button>
        <button
          onClick={resetAnimation}
          disabled={completedStrokes.length === 0 && activeStroke === -1}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 border-border rounded-sm
                     hover:border-foreground/30 disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {strokes.length} stroke{strokes.length !== 1 ? "s" : ""} total
      </p>
    </div>
  );
}
