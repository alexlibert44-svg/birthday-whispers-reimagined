import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: 0 | 1 | 2;
  life: number;
};

const DEFAULT_COLORS = ["#f0c473", "#f2879b", "#8ec5ff", "#c3a7ff", "#8ff0cb", "#ffffff"];

/**
 * Canvas confetti with rectangles, circles and ribbons.
 * `burstKey` re-fires a burst when it changes; `continuous` keeps a gentle stream falling.
 */
export function Confetti({
  burstKey = 0,
  continuous = false,
  intensity = 1,
  colors = DEFAULT_COLORS,
}: {
  burstKey?: number;
  continuous?: boolean;
  intensity?: number;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const piecesRef = useRef<Piece[]>([]);
  const rafRef = useRef<number>(0);
  const colorsKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const palette = colorsKey.split(",");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (n: number, mode: "burst" | "top") => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let i = 0; i < n; i++) {
        const fromTop = mode === "top";
        // Bursts fire from the two bottom corners plus the centre, like party poppers.
        const lane = i % 3;
        const originX = fromTop ? Math.random() * w : lane === 0 ? 0 : lane === 1 ? w : w / 2;
        piecesRef.current.push({
          x: originX,
          y: fromTop ? -20 - Math.random() * 140 : h * (fromTop ? 0 : 0.72),
          vx: fromTop
            ? (Math.random() - 0.5) * 1.6
            : lane === 0
              ? 3 + Math.random() * 6
              : lane === 1
                ? -3 - Math.random() * 6
                : (Math.random() - 0.5) * 7,
          vy: fromTop ? 1.3 + Math.random() * 2.3 : -8 - Math.random() * 8,
          size: 5 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          color: palette[Math.floor(Math.random() * palette.length)] ?? "#ffffff",
          shape: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
          life: 0,
        });
      }
    };

    if (!reduced) spawn(Math.round(150 * intensity), "burst");

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      if (continuous && !reduced && Math.random() < 0.3 * intensity) spawn(2, "top");

      piecesRef.current = piecesRef.current.filter((p) => {
        p.life += dt;
        p.vy += 0.13 * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 320);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.55);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, p.size / 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        return p.y < canvas.offsetHeight + 80 && p.life < 340;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      piecesRef.current = [];
    };
  }, [burstKey, continuous, intensity, colorsKey]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
