import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "نظام كشف تعارض الجداول الدراسية | الأكاديمية الحديثة",
    short_name: "جدول الأكاديمية",
    description:
      "ابني جدولك الدراسي واكتشف أي تعارض في المواعيد بين المواد قبل التسجيل.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fc",
    theme_color: "#142c63",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
