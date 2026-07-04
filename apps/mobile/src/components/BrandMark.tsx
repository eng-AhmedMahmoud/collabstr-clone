import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Line,
  Circle,
  G,
} from "react-native-svg";

type Props = { size?: number };

// Ported from apps/web/src/components/brand-mark.tsx (date-palm mark).
export function BrandMark({ size = 64 }: Props) {
  return (
    <Svg viewBox="0 0 64 64" width={size} height={size}>
      <Defs>
        <LinearGradient id="frond" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#a7f3d0" />
          <Stop offset="60%" stopColor="#34d399" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
        <LinearGradient id="trunk" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#fbe27a" />
          <Stop offset="100%" stopColor="#b45309" />
        </LinearGradient>
        <RadialGradient id="date" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fde68a" />
          <Stop offset="100%" stopColor="#d97706" />
        </RadialGradient>
      </Defs>

      <Path d="M30 56 L34 56 L36 28 L28 28 Z" fill="url(#trunk)" stroke="#7c2d12" strokeWidth={0.5} />
      {[36, 42, 48].map((y) => (
        <Line key={y} x1={28.5} y1={y} x2={35.5} y2={y} stroke="#7c2d12" strokeWidth={0.7} opacity={0.6} />
      ))}

      <G>
        {[[29, 28], [33, 27.5], [31, 30], [35, 29], [27, 30]].map(([cx, cy], i) => (
          <Circle key={i} cx={cx} cy={cy} r={1.6} fill="url(#date)" />
        ))}
      </G>

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
        <Path key={i} d={d} fill="none" stroke="url(#frond)" strokeWidth={2.5} strokeLinecap="round" opacity={0.92} />
      ))}
    </Svg>
  );
}
