import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          borderRadius: "36px",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "72px",
            fontWeight: "700",
            fontFamily: "system-ui",
            lineHeight: 1,
          }}
        >
          OC
        </span>
      </div>
    ),
    {
      ...size,
    },
  );
}
