import { useRef, useState, useCallback, useEffect } from "react";
import { Eraser, Undo2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanjiCanvasProps {
  /** The kanji character to show as a faint guide behind the canvas */
  guideKanji?: string;
  /** Show guide character as watermark */
  showGuide?: boolean;
  /** Canvas size in pixels */
  size?: number;
  /** Called when the user finishes a stroke */
  onStrokeEnd?: () => void;
  className?: string;
}

interface Stroke {
  points: { x: number; y: number }[];
}

export function KanjiCanvas({
  guideKanji,
  showGuide = true,
  size = 280,
  onStrokeEnd,
  className,
}: KanjiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke>({ points: [] });

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scale = size / rect.width;
      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scale,
          y: (touch.clientY - rect.top) * scale,
        };
      }
      return {
        x: (e.clientX - rect.left) * scale,
        y: (e.clientY - rect.top) * scale,
      };
    },
    [size]
  );

  const redraw = useCallback(
    (allStrokes: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);

      // Draw grid lines
      ctx.strokeStyle = "hsl(30 15% 85% / 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw strokes
      allStrokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = "hsl(0 0% 8%)";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    },
    [size]
  );

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    currentStroke.current = { points: [pos] };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStroke.current.points.push(pos);

    // Live draw current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pts = currentStroke.current.points;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = "hsl(0 0% 8%)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.current.points.length > 1) {
      setStrokes((prev) => [...prev, { ...currentStroke.current }]);
      onStrokeEnd?.();
    }
    currentStroke.current = { points: [] };
  };

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    setStrokes([]);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: size, maxWidth: "100%" }}>
        {/* Guide kanji watermark */}
        {showGuide && guideKanji && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ fontSize: size * 0.7 }}
          >
            <span className="japanese-text text-muted-foreground/15 font-bold">
              {guideKanji}
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="border-2 border-border rounded-sm bg-card touch-none cursor-crosshair w-full"
          style={{ aspectRatio: "1/1" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={strokes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 border-border rounded-sm
                     hover:border-foreground/30 disabled:opacity-30 transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </button>
        <button
          onClick={clear}
          disabled={strokes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 border-border rounded-sm
                     hover:border-destructive/50 hover:text-destructive disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {strokes.length} stroke{strokes.length !== 1 ? "s" : ""} drawn
      </p>
    </div>
  );
}
