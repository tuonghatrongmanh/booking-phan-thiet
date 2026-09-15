// URL goc that su cua site khi da deploy - dung cho sitemap.xml, robots.txt, va cac
// truong "url"/"image" tuyet doi trong du lieu co cau truc (JSON-LD) vi Google yeu cau
// duong dan tuyet doi cho nhung cho nay (khac voi link/anh thuong trong trang co the
// de duong dan tuong doi). Co the ghi de qua bien moi truong NEXT_PUBLIC_SITE_URL neu
// sau nay deploy o domain khac domain that (vd staging).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bookingphanthiet.com").replace(/\/$/, "");

export function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
