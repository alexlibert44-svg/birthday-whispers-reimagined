/** Real SVG birthday visuals — no emoji stand-ins. */

export function CakeSVG({
  size = 160,
  accent = "#f0c473",
  className = "",
}: {
  size?: number;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Birthday cake"
    >
      <defs>
        <linearGradient id="cake-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe6f0" />
          <stop offset="100%" stopColor="#ffb6d0" />
        </linearGradient>
        <linearGradient id="cake-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9d9b0" />
          <stop offset="100%" stopColor="#e0a86a" />
        </linearGradient>
      </defs>

      {/* plate */}
      <ellipse cx="100" cy="176" rx="76" ry="10" fill="#ffffff" opacity="0.16" />

      {/* bottom tier */}
      <rect x="30" y="120" width="140" height="52" rx="12" fill="url(#cake-base)" />
      <rect x="30" y="120" width="140" height="14" rx="7" fill="#fff3f7" opacity="0.9" />

      {/* top tier */}
      <rect x="52" y="80" width="96" height="46" rx="11" fill="url(#cake-body)" />
      <path
        d="M52 92 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 v-12 H52 z"
        fill="#fff8fb"
      />

      {/* sprinkles */}
      {[
        [66, 140],
        [86, 150],
        [110, 138],
        [132, 152],
        [150, 142],
        [96, 162],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={accent} opacity="0.9" />
      ))}

      {/* candles */}
      {[76, 100, 124].map((x, i) => (
        <g key={x}>
          <rect x={x - 4} y="48" width="8" height="34" rx="3" fill={i === 1 ? accent : "#ffffff"} />
          <g className="animate-flicker" style={{ transformOrigin: `${x}px 46px`, animationDelay: `${i * 0.25}s` }}>
            <ellipse cx={x} cy="40" rx="6" ry="10" fill="#ffb340" opacity="0.95" />
            <ellipse cx={x} cy="42" rx="3" ry="5.5" fill="#fff3c4" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export function GiftBoxSVG({
  size = 150,
  accent = "#f0c473",
  open = false,
  className = "",
}: {
  size?: number;
  accent?: string;
  open?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Gift box"
    >
      <defs>
        <linearGradient id="box-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="180" rx="62" ry="9" fill="#000" opacity="0.25" />

      {/* body */}
      <rect x="42" y="82" width="116" height="90" rx="10" fill="url(#box-body)" />
      <rect x="92" y="82" width="16" height="90" fill="#ffffff" opacity="0.55" />

      {/* lid */}
      <g
        style={{
          transform: open ? "translateY(-38px) rotate(-12deg)" : "none",
          transformOrigin: "100px 80px",
          transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <rect x="32" y="62" width="136" height="28" rx="9" fill={accent} />
        <rect x="92" y="62" width="16" height="28" fill="#ffffff" opacity="0.6" />
        {/* bow */}
        <path d="M100 62 C 78 62, 66 40, 84 34 C 98 30, 100 52, 100 62 z" fill="#ffffff" opacity="0.9" />
        <path d="M100 62 C 122 62, 134 40, 116 34 C 102 30, 100 52, 100 62 z" fill="#ffffff" opacity="0.9" />
        <circle cx="100" cy="60" r="7" fill="#ffffff" />
      </g>
    </svg>
  );
}
