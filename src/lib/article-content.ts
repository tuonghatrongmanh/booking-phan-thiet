// Cac ham xu ly HTML bai viet (da qua sanitizeArticleHtml) de phuc vu giao dien doc
// bai kieu tap chi du lich: muc luc tu dong (id gan vao <h2>), thoi gian doc uoc tinh,
// va tach noi dung de chen khoi CTA giua bai - tat ca chay o RENDER TIME tren HTML da
// sach san, khong ghi de lai vao DB nen khong can sanitize lai.
export type ArticleHeading = { id: string; text: string };

export function prepareArticleContent(html: string): { html: string; headings: ArticleHeading[] } {
  const headings: ArticleHeading[] = [];
  let index = 0;
  const withIds = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    index += 1;
    const id = `section-${index}`;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: withIds, headings };
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Cat noi dung ngay TRUOC the <h2> thu N (1-indexed) - dung de chen 1 khoi CTA quang
// cao/lien he giua bai sau khoang 2 section dau, khong can them truong rieng trong DB.
// Neu bai khong du N section, tra ve after rong (goi noi khong render CTA).
export function splitBeforeHeading(html: string, headingNumber: number): { before: string; after: string } {
  const regex = /<h2[^>]*>/g;
  let match: RegExpExecArray | null;
  let count = 0;
  let splitIndex = -1;
  while ((match = regex.exec(html))) {
    count += 1;
    if (count === headingNumber) {
      splitIndex = match.index;
      break;
    }
  }
  if (splitIndex === -1) return { before: html, after: "" };
  return { before: html.slice(0, splitIndex), after: html.slice(splitIndex) };
}

// Thay placeholder <div data-video-id="..."> (luu boi VideoEmbed extension) bang
// iframe YouTube THAT tai luc RENDER (khong phai luc luu) - vi sanitize-html khong
// the tin cay src iframe tuy y tu rich-text, nen chi chen iframe voi src CO DINH
// (youtube.com/embed/<id>) do CHINH code nay tu xay, khong lay tu du lieu admin nhap.
// ID da duoc kiem tra dinh dang o sanitize-html.ts (exclusiveFilter) luc luu, nhung
// van kiem tra lai lan nua o day cho chac (defense in depth).
export function injectVideoEmbeds(html: string): string {
  return html.replace(/<div[^>]*data-video-id="([^"]*)"[^>]*><\/div>/g, (match, id: string) => {
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return "";
    return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  });
}

// Trich cac cau hoi/tra loi tu khoi FAQ (da luu san dang <details class="faq-item">)
// de dung cho FAQPage JSON-LD - loi ich SEO them ma khong can luu rieng o DB.
export function extractFaqItems(html: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const detailsRegex = /<details class="faq-item">\s*<summary class="faq-question">([\s\S]*?)<\/summary>\s*<p class="faq-answer">([\s\S]*?)<\/p>\s*<\/details>/g;
  let match: RegExpExecArray | null;
  while ((match = detailsRegex.exec(html))) {
    items.push({ question: match[1].trim(), answer: match[2].trim() });
  }
  return items;
}
