/**
 * Nakhla brand mark — stylised date palm with a fruit cluster.
 * Trunk is a tapered ridge; 7 fronds fan symmetrically; a saffron date
 * cluster nestles where the crown meets the trunk. The whole mark scales
 * cleanly inside the rounded gradient tile already used as the avatar
 * frame, so the parent can keep its existing classes.
 */
export function BrandMark({ className = "", title = "Nakhla" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="nakhla-frond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="60%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="nakhla-trunk" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fbe27a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="nakhla-date" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* Trunk — tapered diamond ridge */}
      <path
        d="M30 56 L34 56 L36 28 L28 28 Z"
        fill="url(#nakhla-trunk)"
        stroke="#7c2d12"
        strokeWidth="0.5"
      />
      {/* Trunk ring detail */}
      {[36, 42, 48].map((y) => (
        <line key={y} x1="28.5" y1={y} x2="35.5" y2={y} stroke="#7c2d12" strokeWidth="0.7" opacity="0.6" />
      ))}

      {/* Date cluster — saffron orbs nestled at crown */}
      {[
        [29, 28], [33, 27.5], [31, 30], [35, 29], [27, 30],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.6" fill="url(#nakhla-date)" />
      ))}

      {/* Fronds — 7 curved blades fanning from the crown */}
      {[
        "M32 26 C 12 18, 6 10, 4 4",
        "M32 26 C 12 24, 6 22, 2 22",
        "M32 26 C 14 30, 8 36, 4 44",
        "M32 26 C 26 14, 22 6, 18 2",
        "M32 26 C 32 12, 32 6, 32 2",
        "M32 26 C 38 14, 42 6, 46 2",
        "M32 26 C 52 18, 58 10, 60 4",
        "M32 26 C 52 24, 58 22, 62 22",
        "M32 26 C 50 30, 56 36, 60 44",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="url(#nakhla-frond)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.92}
        />
      ))}
    </svg>
  );
}
