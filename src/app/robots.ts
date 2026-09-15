import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Cho phep Google/Bing... crawl toan bo trang cong khai, chan cac khu vuc rieng tu
// (trang quan tri, API noi bo, trang tai khoan ca nhan) - giup cong cu tim kiem/AI
// (Google AI Overview, Gemini) biet chinh xac phan nao cua site la noi dung cong khai
// nen doc va trich dan.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/tai-khoan"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
