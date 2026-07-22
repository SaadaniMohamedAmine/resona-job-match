import { ImageResponse } from "next/og";
import { Monogram, getSpaceGroteskBold } from "@/lib/brand-icon";

export async function GET() {
  return new ImageResponse(<Monogram size={512} />, {
    width: 512,
    height: 512,
    fonts: [getSpaceGroteskBold()],
  });
}
