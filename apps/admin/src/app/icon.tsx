import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #006C35 0%, #1a8f4f 55%, #c8a951 100%)",
          color: "white",
          fontSize: 22,
          fontWeight: 900,
          borderRadius: 7,
        }}
      >
        ن
      </div>
    ),
    { ...size },
  );
}
