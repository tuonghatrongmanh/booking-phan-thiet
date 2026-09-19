// Bo phan tich SEO kieu Yoast - chay hoan toan tren client (recompute moi lan admin
// go phim), khong goi API nao. Input la HTML tho tu rich-text editor, KHONG lam sach
// o day (viec lam sach/sanitize xay ra rieng phia server luc luu).

export type SeoCheckStatus = "good" | "warning" | "bad";
export type SeoCheck = { id: string; label: string; status: SeoCheckStatus; message: string };
export type SeoAnalysis = { checks: SeoCheck[]; score: number; scoreLabel: string; scoreColor: string };

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle.trim()) return 0;
  const re = new RegExp(escapeRegExp(needle.trim().toLowerCase()), "gi");
  return (haystack.toLowerCase().match(re) || []).length;
}

function rangeCheck(
  id: string,
  label: string,
  value: number,
  ideal: [number, number],
  acceptable: [number, number],
  unit: string,
  emptyMessage?: string
): SeoCheck {
  if (value === 0 && emptyMessage) {
    return { id, label, status: "bad", message: emptyMessage };
  }
  if (value >= ideal[0] && value <= ideal[1]) {
    return { id, label, status: "good", message: `${value} ${unit} - trong khoảng lý tưởng (${ideal[0]}-${ideal[1]}).` };
  }
  if (value >= acceptable[0] && value <= acceptable[1]) {
    const dir = value < ideal[0] ? "hơi ngắn, nên dài thêm" : "hơi dài, nên rút ngắn";
    return { id, label, status: "warning", message: `${value} ${unit} - ${dir} để về khoảng ${ideal[0]}-${ideal[1]}.` };
  }
  const dir = value < acceptable[0] ? "quá ngắn" : "quá dài, có thể bị Google cắt bớt";
  return { id, label, status: "bad", message: `${value} ${unit} - ${dir}. Nên nằm trong khoảng ${ideal[0]}-${ideal[1]}.` };
}

// options.listing = true cho trang danh sách / thẻ địa điểm / món ăn (mô tả ngắn, ít heading/link/ảnh
// trong nội dung): bỏ các mục chỉ hợp với bài viết dài và hạ ngưỡng số từ.
export type SeoAnalyzeOptions = { skipChecks?: string[]; minWords?: [number, number] };

export const LISTING_SEO_OPTIONS: SeoAnalyzeOptions = {
  skipChecks: ["heading-structure", "internal-link", "image-alt"],
  minWords: [40, 90],
};

export function analyzeSeo(
  input: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    contentHtml: string;
  },
  options: SeoAnalyzeOptions = {}
): SeoAnalysis {
  const [badWords, warnWords] = options.minWords ?? [150, 300];
  const effectiveTitle = (input.metaTitle || input.title).trim();
  const metaDescription = input.metaDescription.trim();
  const kw = input.focusKeyword.trim();
  const plainText = stripHtml(input.contentHtml);
  const wordCount = countWords(plainText);

  const checks: SeoCheck[] = [];

  checks.push(
    rangeCheck("title-length", "Độ dài tiêu đề SEO", effectiveTitle.length, [50, 60], [35, 70], "ký tự", "Chưa có tiêu đề SEO.")
  );

  checks.push(
    rangeCheck(
      "meta-description-length",
      "Độ dài mô tả SEO",
      metaDescription.length,
      [120, 150],
      [80, 160],
      "ký tự",
      "Chưa có mô tả SEO."
    )
  );

  if (!kw) {
    checks.push({
      id: "focus-keyword",
      label: "Từ khóa chính",
      status: "warning",
      message: "Chưa nhập từ khóa chính - không thể kiểm tra các mục liên quan đến từ khóa dưới đây.",
    });
  } else {
    checks.push({
      id: "keyword-in-title",
      label: "Từ khóa trong tiêu đề",
      status: effectiveTitle.toLowerCase().includes(kw.toLowerCase()) ? "good" : "bad",
      message: effectiveTitle.toLowerCase().includes(kw.toLowerCase())
        ? "Tiêu đề đã chứa từ khóa chính."
        : `Tiêu đề chưa chứa từ khóa "${kw}".`,
    });

    checks.push({
      id: "keyword-in-slug",
      label: "Từ khóa trong đường dẫn (slug)",
      status: input.slug.toLowerCase().includes(kw.toLowerCase().replace(/\s+/g, "-")) ? "good" : "warning",
      message: input.slug.toLowerCase().includes(kw.toLowerCase().replace(/\s+/g, "-"))
        ? "Đường dẫn đã chứa từ khóa chính."
        : `Đường dẫn chưa chứa từ khóa "${kw}".`,
    });

    checks.push({
      id: "keyword-in-meta-description",
      label: "Từ khóa trong mô tả SEO",
      status: metaDescription.toLowerCase().includes(kw.toLowerCase()) ? "good" : "warning",
      message: metaDescription.toLowerCase().includes(kw.toLowerCase())
        ? "Mô tả SEO đã chứa từ khóa chính."
        : `Mô tả SEO chưa chứa từ khóa "${kw}".`,
    });

    const occurrences = countOccurrences(plainText, kw);
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
    let densityStatus: SeoCheckStatus = "good";
    let densityMsg = `Mật độ từ khóa ${density.toFixed(1)}% (${occurrences} lần / ${wordCount} từ) - hợp lý.`;
    if (occurrences === 0) {
      densityStatus = "bad";
      densityMsg = `Từ khóa "${kw}" chưa xuất hiện trong nội dung.`;
    } else if (density > 5) {
      densityStatus = "warning";
      densityMsg = `Mật độ từ khóa ${density.toFixed(1)}% - hơi cao, tránh nhồi nhét từ khóa (nên 2-5%).`;
    } else if (density < 0.5) {
      densityStatus = "warning";
      densityMsg = `Mật độ từ khóa ${density.toFixed(1)}% - hơi thấp, có thể nhắc lại từ khóa thêm 1-2 lần (nên 2-5%).`;
    }
    checks.push({ id: "keyword-density", label: "Mật độ từ khóa trong nội dung", status: densityStatus, message: densityMsg });
  }

  let lengthStatus: SeoCheckStatus = "good";
  let lengthMsg = `${wordCount} từ - đủ dài để cung cấp thông tin chi tiết.`;
  if (wordCount < badWords) {
    lengthStatus = "bad";
    lengthMsg = `${wordCount} từ - quá ngắn, nên viết ít nhất ${warnWords} từ để giải quyết đầy đủ ý định tìm kiếm.`;
  } else if (wordCount < warnWords) {
    lengthStatus = "warning";
    lengthMsg = `${wordCount} từ - nên viết thêm để đạt tối thiểu ${warnWords} từ.`;
  }
  checks.push({ id: "content-length", label: "Độ dài nội dung", status: lengthStatus, message: lengthMsg });

  const h1Count = (input.contentHtml.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (input.contentHtml.match(/<h2[\s>]/gi) || []).length;
  checks.push({
    id: "heading-structure",
    label: "Cấu trúc heading (H2, H3)",
    status: h1Count > 0 ? "bad" : h2Count === 0 && wordCount > 300 ? "warning" : "good",
    message:
      h1Count > 0
        ? "Nội dung không nên chứa H1 - tiêu đề bài viết đã tự là H1 duy nhất."
        : h2Count === 0 && wordCount > 300
          ? "Nên chia nội dung dài thành các đoạn có H2/H3 để dễ đọc và chứa từ khóa liên quan."
          : "Cấu trúc heading hợp lý.",
  });

  const links = [...input.contentHtml.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const hasInternalLink = links.some((href) => href.startsWith("/") || href.includes("bookingphanthiet.com"));
  checks.push({
    id: "internal-link",
    label: "Liên kết nội bộ",
    status: links.length === 0 ? "warning" : hasInternalLink ? "good" : "warning",
    message:
      links.length === 0
        ? "Chưa có liên kết nào - nên chèn ít nhất 1 liên kết nội bộ đến bài viết/địa điểm liên quan."
        : hasInternalLink
          ? `Đã có ${links.length} liên kết, bao gồm liên kết nội bộ.`
          : `Đã có ${links.length} liên kết nhưng chưa có liên kết nội bộ nào.`,
  });

  const images = [...input.contentHtml.matchAll(/<img\s+[^>]*>/gi)];
  const imagesWithoutAlt = images.filter((m) => !/alt=["'][^"']+["']/.test(m[0]));
  checks.push({
    id: "image-alt",
    label: "Thẻ Alt cho hình ảnh",
    status: images.length === 0 ? "warning" : imagesWithoutAlt.length === 0 ? "good" : "bad",
    message:
      images.length === 0
        ? "Chưa có hình ảnh nào trong nội dung."
        : imagesWithoutAlt.length === 0
          ? `Cả ${images.length} hình ảnh đều đã có thẻ Alt mô tả.`
          : `${imagesWithoutAlt.length}/${images.length} hình ảnh chưa có thẻ Alt mô tả.`,
  });

  const skip = new Set(options.skipChecks ?? []);
  const finalChecks = checks.filter((c) => !skip.has(c.id));
  const good = finalChecks.filter((c) => c.status === "good").length;
  const score = Math.round((good / finalChecks.length) * 100);
  const scoreLabel = score >= 80 ? "Tốt" : score >= 50 ? "Cần cải thiện" : "Yếu";
  const scoreColor = score >= 80 ? "text-brand-green" : score >= 50 ? "text-amber-500" : "text-brand-red";

  return { checks: finalChecks, score, scoreLabel, scoreColor };
}
