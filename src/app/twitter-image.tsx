import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "OpenCV — Free CV Builder";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          padding: "48px",
          fontFamily: "system-ui",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: 1,
              }}
            >
              OC
            </span>
          </div>
          <span
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            OpenCV
          </span>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1
            style={{
              color: "white",
              fontSize: "48px",
              fontWeight: "700",
              lineHeight: "1.1",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Build a professional CV{"\n"}that gets you hired
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "20px",
              marginTop: "20px",
            }}
          >
            20+ templates • Matching cover letters • Free PDF download
          </p>
        </div>

        {/* Bottom */}
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "16px",
          }}
        >
          opencv.build
        </span>
      </div>
    ),
    { ...size },
  );
}
