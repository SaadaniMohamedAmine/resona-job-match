import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // pdf-parse wraps pdfjs-dist, which locates its worker script via a self-referential
  // path at runtime; bundling it breaks that lookup ("Cannot find module .../pdf.worker.mjs").
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default withNextIntl(nextConfig);
