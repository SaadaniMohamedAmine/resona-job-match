import { ImageResponse } from "next/og";
import { GRAPHITE, CHAMPAGNE, getSpaceGroteskBold } from "@/lib/brand-icon";

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
          position: "relative",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: GRAPHITE,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -96,
            bottom: -96,
            width: 600,
            height: 600,
            borderRadius: "50%",
            border: "2px solid rgba(201,169,97,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -48,
            bottom: -48,
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid rgba(201,169,97,0.05)",
          }}
        />
        <div style={{ fontSize: 72, fontWeight: 700, color: CHAMPAGNE, letterSpacing: "-2px" }}>
          Résona
        </div>
        <div style={{ fontSize: 28, color: "#B8AD98", marginTop: 16 }}>
          Your resume, aligned to every opportunity.
        </div>
      </div>
    ),
    { ...size, fonts: [getSpaceGroteskBold()] }
  );
}
