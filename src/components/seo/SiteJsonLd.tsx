import { getSiteSettings } from "@/lib/settings";
import { buildSiteGraph } from "@/lib/site-jsonld";

// JSON-LD toàn site: Organization + WebSite (+ Person người sáng lập nếu đã điền ở Cài đặt).
export default async function SiteJsonLd() {
  const settings = await getSiteSettings();
  const json = JSON.stringify(buildSiteGraph(settings)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
