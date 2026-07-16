import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16140F",
          color: "#C9A961",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>Résona</div>
        <div style={{ fontSize: 28, color: "#B8AD98", marginTop: 16 }}>
          Your resume, aligned to every opportunity.
        </div>
      </div>
    ),
    size
  );
}
