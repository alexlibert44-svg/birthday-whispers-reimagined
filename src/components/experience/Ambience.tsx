import { useEffect, useMemo, useState } from "react";

/** Randomised decoration is client-only so server and client markup always match. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Slow twinkling star field. */
export function Starfield({ density = 40, color = "#ffffff" }: { density?: number; color?: string }) {
  const mounted = useMounted();
  const stars = useMemo(
    () =>
      Array.from({ length: density }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 5,
      })),
    [density],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <span
          key={s.id}
          className="animate-twinkle absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Soft floating light motes drifting upward. */
export function FloatingMotes({ count = 14 }: { count?: number }) {
  const mounted = useMounted();
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 10,
        duration: 14 + Math.random() * 18,
        delay: Math.random() * 16,
        drift: `${Math.random() * 80 - 40}px`,
      })),
    [count],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <span
          key={m.id}
          className="animate-float-up absolute rounded-full blur-[1px]"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            background: "var(--gift-accent)",
            opacity: 0.35,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            ["--drift" as string]: m.drift,
          }}
        />
      ))}
    </div>
  );
}

/** Four-point sparkles that pop in and out. */
export function Sparkles({
  count = 18,
  colors = ["#ffffff"],
  intensity = 1,
}: {
  count?: number;
  colors?: string[];
  intensity?: number;
}) {
  const mounted = useMounted();
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 96,
        top: Math.random() * 92,
        size: 8 + Math.random() * 18 * intensity,
        delay: Math.random() * 5,
        duration: 2.2 + Math.random() * 2.6,
        color: colors[i % colors.length] ?? "#ffffff",
      })),
    [count, colors, intensity],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((s) => (
        <svg
          key={s.id}
          className="animate-sparkle absolute"
          viewBox="0 0 24 24"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            filter: `drop-shadow(0 0 6px ${s.color})`,
          }}
          aria-hidden
        >
          <path
            d="M12 0c.6 6.4 5 10.8 12 12-7 1.2-11.4 5.6-12 12-.6-6.4-5-10.8-12-12C7 10.8 11.4 6.4 12 0z"
            fill={s.color}
          />
        </svg>
      ))}
    </div>
  );
}

/** Real balloons: shaded body, highlight, knot, curved string, gentle sway. */
export function Balloons({
  count = 12,
  colors = ["#ff7ab8", "#a689ff", "#6fb7ff", "#ffd67a", "#ff6f91", "#ffffff"],
}: {
  count?: number;
  colors?: string[];
}) {
  const mounted = useMounted();
  const balloons = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const edge = i % 2 === 0;
        return {
          id: i,
          left: edge ? Math.random() * 26 + 1 : Math.random() * 26 + 71,
          color: colors[i % colors.length] ?? "#ff7ab8",
          size: 34 + Math.random() * 32,
          duration: 11 + Math.random() * 9,
          delay: Math.random() * 7,
          drift: `${Math.random() * 90 - 45}px`,
          sway: 3 + Math.random() * 3,
        };
      }),
    [count, colors],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {balloons.map((b) => (
        <span
          key={b.id}
          className="animate-float-up absolute"
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            ["--drift" as string]: b.drift,
          }}
        >
          <span
            className="animate-sway block"
            style={{ animationDuration: `${b.sway}s`, animationDelay: `${b.delay / 2}s` }}
          >
            <svg width={b.size} height={b.size * 2} viewBox="0 0 60 120" aria-hidden>
              <defs>
                <radialGradient id={`bal-${b.id}`} cx="35%" cy="28%" r="72%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="45%" stopColor={b.color} />
                  <stop offset="100%" stopColor={b.color} stopOpacity="0.92" />
                </radialGradient>
              </defs>
              <ellipse cx="30" cy="34" rx="26" ry="32" fill={`url(#bal-${b.id})`} />
              <path d="M30 66 l-5 7 h10 z" fill={b.color} opacity="0.9" />
              <path
                d="M30 73 C 22 84, 38 92, 30 103 C 24 111, 32 114, 30 120"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.2"
                fill="none"
              />
              <ellipse cx="20" cy="22" rx="6" ry="9" fill="#ffffff" opacity="0.35" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}
