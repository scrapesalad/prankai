import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512
};
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
          background: "linear-gradient(135deg, #2e86ff 0%, #43d4d8 55%, #ffe06b 100%)",
          color: "#0b1b2b",
          fontSize: "180px",
          fontWeight: 800,
          letterSpacing: "6px",
          borderRadius: "120px"
        }}
      >
        P D
      </div>
    ),
    size
  );
}
