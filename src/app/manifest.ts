import type { MetadataRoute } from "next";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  BRAND_BACKGROUND_COLOR,
  BRAND_THEME_COLOR,
} from "@/lib/constants";

/*
 * Web App Manifest (thay file manifest.webmanifest tĩnh của bản vanilla) —
 * Next sinh ra tại /manifest.webmanifest. Giữ nguyên tên, màu và icon để
 * điện thoại đã cài app cũ vẫn nhận ra cùng một app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_BACKGROUND_COLOR,
    theme_color: BRAND_THEME_COLOR,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
