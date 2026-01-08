import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prank Dial AI",
    short_name: "Prank Dial AI",
    description: "Prank call templates, live calling, and shareable voice AI experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#0f1d2a",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
