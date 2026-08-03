import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = "OpenCV — Free CV Builder & Cover Letter Maker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded Open Graph image served at /opengraph-image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            OC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
              OpenCV
            </div>
            <div style={{ fontSize: 26, opacity: 0.85, marginTop: 8 }}>
              Free CV Builder &amp; Cover Letter Maker
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 20,
            opacity: 0.75,
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          12+ ATS-friendly templates · matching cover letters · one-click PDF
        </div>
      </div>
    ),
    { ...size },
  );
}
