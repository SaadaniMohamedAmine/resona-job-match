import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Résona",
    short_name: "Résona",
    description: "Your resume, aligned to every opportunity.",
    start_url: "/",
    background_color: "#16140F",
    theme_color: "#16140F",
    icons: [
      { src: "/manifest-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/manifest-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/manifest-icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
