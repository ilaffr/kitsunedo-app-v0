import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * InkWipeTransition
 * 
 * Plays a brush-stroke ink-wipe across the screen each time the route changes.
 * Uses an SVG mask shaped like a sumi-e brush sweep so the ink reveals/leaves
 * with organic, paper-like edges (no straight rectangles).
 */
export function InkWipeTransition() {
  const location = useLocation();
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Start the wipe on every pathname change
    setKey((k) => k + 1);
    setPhase("in");

    const t1 = window.setTimeout(() => setPhase("out"), 380); // ink fully covers
    const t2 = window.setTimeout(() => setPhase("idle"), 900); // wipe finished
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (phase === "idle") return null;

  return (
    <div
      key={key}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Brush-stroke wipe panel */}
      <div
        className={
          phase === "in"
            ? "ink-wipe-in absolute inset-0"
            : "ink-wipe-out absolute inset-0"
        }
      >
        {/* Layered ink wash for a sumi-e feel */}
        <div className="absolute inset-0 bg-foreground" />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 40%, hsl(0 0% 100% / 0.06), transparent 60%), radial-gradient(ellipse at 70% 60%, hsl(0 0% 0% / 0.4), transparent 70%)",
          }}
        />
        {/* Paper grain on top of ink for texture */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>
    </div>
  );
}
