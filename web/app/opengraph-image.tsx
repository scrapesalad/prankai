import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const baseUrl = "https://prankai.com";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "60px",
          background: "#0b1b2b",
          color: "#ffffff",
          fontFamily: "sans-serif"
        }}
      >
        <img
          src={`${baseUrl}/images/ai-control-room.png`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(9, 20, 32, 0.85) 0%, rgba(9, 20, 32, 0.2) 70%)"
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "640px",
            zIndex: 1
          }}
        >
          <div
            style={{
              fontSize: "22px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontWeight: 700
            }}
          >
            Prank Dial AI
          </div>
          <div style={{ fontSize: "72px", fontWeight: 800, lineHeight: 1.05 }}>
            Smarter AI prank calls.
            <br />
            Cleaner laughs.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.4 }}>
            67 templates. Live listen. Ethical by design.
          </div>
        </div>
      </div>
    ),
    size
  );
}
