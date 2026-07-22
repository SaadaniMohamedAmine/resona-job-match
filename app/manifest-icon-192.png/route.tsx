import { ImageResponse } from "next/og";
import { Monogram, getSpaceGroteskBold } from "@/lib/brand-icon";

export async function GET() {
  return new ImageResponse(<Monogram size={192} />, {
    width: 192,
    height: 192,
    fonts: [getSpaceGroteskBold()],
  });
}
