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
  // @napi-rs/canvas's platform-specific native binary and pdfjs-dist's worker script
  // (pdf.worker.mjs) are both resolved dynamically at runtime, so Next's automatic file
  // tracing can't detect them statically and drops them from the deployed function —
  // force-include both here.
  outputFileTracingIncludes: {
    "/api/analyze": ["./node_modules/@napi-rs/**/*", "./node_modules/pdfjs-dist/**/*"],
  },
};

export default withNextIntl(nextConfig);
