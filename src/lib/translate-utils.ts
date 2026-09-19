// Ham thuan cho dich giao dien: loc chuoi can dich, chuan hoa, chia lo. Dung ca o client lan server.
const VIET_CHARS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

export function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// Chi dich chuoi co dau tieng Viet va co it nhat 2 chu cai (bo qua gia "450.000đ", ten thuong hieu khong dau...)
export function needsTranslation(s: string): boolean {
  const t = normalizeText(s);
  if (t.length < 2 || t.length > 600) return false;
  if (!VIET_CHARS.test(t)) return false;
  const letters = t.replace(/[^\p{L}]/gu, "");
  return letters.length >= 2;
}

export function splitBatches(strings: string[], maxItems = 50, maxChars = 6000): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  let chars = 0;
  for (const s of strings) {
    if (cur.length >= maxItems || chars + s.length > maxChars) {
      if (cur.length) out.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(s);
    chars += s.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

// Giu khoang trang dau/cuoi cua node goc khi thay bang ban dich
export function withOuterSpace(original: string, translated: string): string {
  const lead = original.match(/^\s*/)?.[0] ?? "";
  const trail = original.match(/\s*$/)?.[0] ?? "";
  return lead + translated + trail;
}
