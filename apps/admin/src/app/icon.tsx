import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Nakhla favicon — palm-tree mark on jade gradient.
 * Inline SVG renders cleanly in satori (Next/OG).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #047857 0%, #10b981 55%, #fbe27a 100%)",
          borderRadius: 14,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 56 L34 56 L36 28 L28 28 Z" fill="#fbe27a" stroke="#7c2d12" strokeWidth="0.6" />
          <circle cx="29" cy="28" r="1.8" fill="#f59e0b" />
          <circle cx="33" cy="27" r="1.8" fill="#f59e0b" />
          <circle cx="31" cy="30" r="1.8" fill="#f59e0b" />
          <path d="M32 26 C 12 18, 6 10, 4 4" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 12 24, 6 22, 2 22" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 14 30, 8 36, 4 44" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 32 12, 32 6, 32 2" fill="none" stroke="#d1fae5" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 52 18, 58 10, 60 4" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 52 24, 58 22, 62 22" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 C 50 30, 56 36, 60 44" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
