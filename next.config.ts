import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // pdf-parse wraps pdfjs-dist, which locates its worker script via a self-referential
  // path at runtime; bundling it breaks that lookup ("Cannot find module .../pdf.worker.mjs").
  // @napi-rs/canvas is pdfjs-dist's native binary dependency (provides DOMMatrix etc.) —
  // bundling it breaks the native binding, so it must stay external too.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  // @napi-rs/canvas's platform-specific native binary is required dynamically at runtime
  // (based on process.platform/arch), so Next's automatic file tracing can't detect it
  // statically and drops it from the deployed function — force-include it here.
  outputFileTracingIncludes: {
    "/api/analyze": ["./node_modules/@napi-rs/**/*"],
  },
};

export default withNextIntl(nextConfig);
