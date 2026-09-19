import type { SiteSettingsData } from "@/lib/settings";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

// Dữ liệu có cấu trúc (schema.org) mô tả TỔ CHỨC + NGƯỜI SÁNG LẬP + WEBSITE để Google hiểu
// "bookingphanthiet.com là của ai, do ai lập ra". Chỉ xuất những thông tin admin đã điền -
// tuyệt đối không tự bịa dữ liệu. Không có tính năng nào ép được Google hiện Knowledge Panel,
// nhưng đây là nền tảng bắt buộc để Google có thể liên kết tên bạn với website.

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ID = `${SITE_URL}/gioi-thieu#founder`;

export function collectSameAs(s: SiteSettingsData): string[] {
  const direct = [s.facebookUrl, s.tiktokUrl, s.youtubeUrl, s.instagramUrl, s.linkedinUrl, s.zaloUrl, s.googleBusinessUrl];
  const extra = (s.sameAsExtra || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l));
  return [...new Set([...direct, ...extra].filter((u) => u && /^https?:\/\//i.test(u)))];
}

export function buildSiteGraph(s: SiteSettingsData): Record<string, unknown> {
  const sameAs = collectSameAs(s);
  const orgName = s.orgName || "Booking Phan Thiết";
  const hasFounder = Boolean(s.founderName);

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: orgName,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo-dark.png"), width: 1000, height: 290 },
    description: s.homeSeoDescription,
    ...(sameAs.length ? { sameAs } : {}),
    ...(s.orgEmail || s.orgPhone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            availableLanguage: "Vietnamese",
            ...(s.orgEmail ? { email: s.orgEmail } : {}),
            ...(s.orgPhone ? { telephone: s.orgPhone } : {}),
          },
        }
      : {}),
    ...(s.orgAddress
      ? { address: { "@type": "PostalAddress", streetAddress: s.orgAddress, addressCountry: "VN" } }
      : {}),
    ...(hasFounder ? { founder: { "@id": FOUNDER_ID } } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: orgName,
    inLanguage: "vi-VN",
    publisher: { "@id": ORG_ID },
  };

  const graph: Record<string, unknown>[] = [organization, website];

  if (hasFounder) {
    graph.push({
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: s.founderName,
      url: `${SITE_URL}/gioi-thieu`,
      ...(s.founderTitle ? { jobTitle: s.founderTitle } : {}),
      ...(s.founderBio ? { description: s.founderBio } : {}),
      ...(s.founderPhoto ? { image: absoluteUrl(s.founderPhoto) } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      worksFor: { "@id": ORG_ID },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
