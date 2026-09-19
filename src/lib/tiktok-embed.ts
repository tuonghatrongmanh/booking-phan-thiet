// Sale có thể dán LINK video TikTok hoặc cả đoạn MÃ NHÚNG (<blockquote class="tiktok-embed" ...>).
// Hàm thuần: rút ra link chuẩn + id video; chỉ nhận tên miền tiktok.com để không dán được link lạ.
export type TiktokRef = { url: string; videoId: string | null };

const HOST_OK = /^(www\.|m\.|vm\.|vt\.)?tiktok\.com$/i;

function fromUrl(raw: string): TiktokRef | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (!HOST_OK.test(u.hostname)) return null;
  const id = u.pathname.match(/\/video\/(\d{8,25})/)?.[1] ?? null;
  const clean = id ? `https://www.tiktok.com${u.pathname.replace(/\/$/, "")}` : `${u.origin.replace("http:", "https:")}${u.pathname}`;
  return { url: clean, videoId: id };
}

export function parseTiktokInput(input: string): TiktokRef | null {
  const text = input.trim();
  if (!text) return null;
  if (text.includes("<")) {
    // mã nhúng: ưu tiên cite="..." (link video), rồi data-video-id="..."
    const cite = text.match(/cite=["']([^"']+)["']/i)?.[1];
    if (cite) {
      const ref = fromUrl(cite);
      if (ref) return ref;
    }
    const id = text.match(/data-video-id=["'](\d{8,25})["']/i)?.[1];
    if (id) return { url: `https://www.tiktok.com/embed/v2/${id}`, videoId: id };
    const src = text.match(/src=["'](https:\/\/www\.tiktok\.com\/embed\/[^"']+)["']/i)?.[1];
    if (src) {
      const idIn = src.match(/(\d{8,25})/)?.[1];
      return idIn ? { url: `https://www.tiktok.com/embed/v2/${idIn}`, videoId: idIn } : null;
    }
    return null;
  }
  return fromUrl(text);
}

export function tiktokEmbedSrc(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

// id video từ link đã lưu (link chuẩn có /video/ID; link rút gọn vm.tiktok.com thì không có)
export function videoIdFromStoredUrl(url: string): string | null {
  return url.match(/\/video\/(\d{8,25})/)?.[1] ?? url.match(/\/embed\/v2\/(\d{8,25})/)?.[1] ?? null;
}
