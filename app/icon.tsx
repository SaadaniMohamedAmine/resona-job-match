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
          backgroundColor: "#16140F",
          border: "2px solid #C9A961",
          borderRadius: 7,
          color: "#C9A961",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        RE
      </div>
    ),
    size
  );
}
