// Lay thumbnail + tieu de THAT cua 1 video TikTok qua oEmbed - endpoint cong khai cua
// TikTok, khong can API key. Khong dung de lay so luot xem/thoi gian dang (oEmbed
// khong tra ve nhung so nay) - card hien thi chi nen dung thumbnail+title, tranh bay
// so lieu gia.
export type TiktokOembedResult = {
  title: string | null;
  thumbnailUrl: string | null;
};

export async function fetchTiktokOembed(sourceUrl: string): Promise<TiktokOembedResult> {
  const empty: TiktokOembedResult = { title: null, thumbnailUrl: null };

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return empty;
  }
  if (!/(^|\.)tiktok\.com$/i.test(url.hostname)) return empty;

  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(sourceUrl)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      title: typeof data.title === "string" ? data.title : null,
      thumbnailUrl: typeof data.thumbnail_url === "string" ? data.thumbnail_url : null,
    };
  } catch {
    return empty;
  }
}
