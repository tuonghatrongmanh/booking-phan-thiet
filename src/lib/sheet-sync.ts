import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { slugifyBase } from "@/lib/slug";

// Doc du lieu (gia tri + mau nen) truc tiep tu file Google Sheets HOAC file Excel that
// (.xlsx) nam tren Google Drive, dung Google Drive API (khong dung Sheets API - Sheets
// API khong doc duoc file Excel "chua convert", day la ly do file thuc te cua chu
// homestay/xe luon la file .xlsx). Ca 2 truong hop deu tai ve dang bytes .xlsx roi doc
// bang exceljs - cho phep doc toan bo luoi o that (mau + gia tri), khong gioi han 1 cot
// dau dong nhu thiet ke ban dau, vi file thuc te la lich theo NGAY, chia theo nhieu tab
// thang, moi villa/xe la 1 cum cot rieng - can doc linh hoat theo cot admin tu chi dinh.

class SheetSyncError extends Error {}

async function downloadWorkbook(fileId: string): Promise<ExcelJS.Workbook> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) throw new SheetSyncError("Chưa cấu hình GOOGLE_SHEETS_API_KEY trong .env");

  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}&fields=mimeType,name`);
  if (!metaRes.ok) {
    const body = await metaRes.json().catch(() => ({}) as { error?: { message?: string } });
    throw new SheetSyncError(body?.error?.message || `Không đọc được thông tin file (HTTP ${metaRes.status})`);
  }
  const meta = (await metaRes.json()) as { mimeType?: string; name?: string };

  const isNativeSheet = meta.mimeType === "application/vnd.google-apps.spreadsheet";
  const downloadUrl = isNativeSheet
    ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )}&key=${apiKey}`
    : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

  const fileRes = await fetch(downloadUrl);
  if (!fileRes.ok) {
    const body = await fileRes.json().catch(() => ({}) as { error?: { message?: string } });
    throw new SheetSyncError(body?.error?.message || `Không tải được file (HTTP ${fileRes.status})`);
  }

  const buffer = await fileRes.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as ArrayBuffer);
  return workbook;
}

// Thay {M}/{YYYY} trong pattern (vd "THÁNG {M}-{YYYY}") bang thang/nam thuc te, roi so
// khop long le (khong phan biet hoa/thuong, khong phan biet dau) voi ten cac tab that
// trong file - vi chu so huu co the go ten tab hoi khac (VD "Tháng 8-2026" thay vi "THÁNG").
function buildExpectedSheetName(pattern: string, date: Date): string {
  return pattern.replace("{M}", String(date.getMonth() + 1)).replace("{YYYY}", String(date.getFullYear()));
}

function findWorksheetByPattern(workbook: ExcelJS.Workbook, pattern: string, date: Date): ExcelJS.Worksheet | null {
  const expected = slugifyBase(buildExpectedSheetName(pattern, date));
  for (const ws of workbook.worksheets) {
    if (slugifyBase(ws.name) === expected) return ws;
  }
  return null;
}

function cellRgb(cell: ExcelJS.Cell): { r: number; g: number; b: number } | null {
  const fill = cell.fill as { type?: string; fgColor?: { argb?: string } } | undefined;
  if (!fill || fill.type !== "pattern") return null;
  const argb = fill.fgColor?.argb;
  if (!argb || argb.length < 6) return null;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
}

const WHITE = { r: 1, g: 1, b: 1 };
const RED = { r: 0.92, g: 0.26, b: 0.21 };
const BLUE = { r: 0.26, g: 0.52, b: 0.96 };
const YELLOW = { r: 0.98, g: 0.74, b: 0.02 };
const CYAN = { r: 0.15, g: 0.65, b: 0.6 };

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

// He so mau khong the chinh xac 100% vi moi nguoi to mau hoi khac nhau - dung khoang
// cach toi cac mau moc (trang/do/xanh duong/vang/xanh cyan) de doan trang thai gan nhat.
// O trong/khong to mau = mac dinh AVAILABLE (khop voi quy uoc "P.TRỐNG" khong mau trong
// file mau cua nguoi dung).
export function classifyCellColor(rgb255: { r: number; g: number; b: number } | null): "AVAILABLE" | "HOLDING" | "UNAVAILABLE" {
  if (!rgb255) return "AVAILABLE";
  const c = { r: rgb255.r / 255, g: rgb255.g / 255, b: rgb255.b / 255 };

  const distances: [ "AVAILABLE" | "HOLDING" | "UNAVAILABLE", number ][] = [
    ["AVAILABLE", colorDistance(c, WHITE)],
    ["UNAVAILABLE", colorDistance(c, RED)],
    ["HOLDING", Math.min(colorDistance(c, BLUE), colorDistance(c, YELLOW), colorDistance(c, CYAN))],
  ];

  distances.sort((a, b) => a[1] - b[1]);
  return distances[0][0];
}

export function parseSheetUrl(input: string): { sheetId: string } | null {
  const idMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/) || input.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = idMatch ? idMatch[1] : /^[a-zA-Z0-9-_]{20,}$/.test(input.trim()) ? input.trim() : null;
  return sheetId ? { sheetId } : null;
}

export type SheetPreviewCell = { value: string; color: { r: number; g: number; b: number } | null };
export type SheetPreview = {
  matchedSheetName: string | null;
  expectedSheetName: string;
  availableSheetNames: string[];
  columns: string[]; // vd ["A","B","C",...]
  rows: { rowNumber: number; cells: Record<string, SheetPreviewCell> }[];
};

const MAX_PREVIEW_ROWS = 40;
const MAX_PREVIEW_COLS = 20;

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Xem truoc luoi o that cua tab thang hien tai (hoac tab dau tien neu khong tim thay
// tab khop pattern) - dung cho man hinh anh xa de admin nhin mau/gia tri that ma chon
// dung cot ngay/cot trang thai cho tung villa/xe, khong phai doan mo.
export async function previewSheet(sheetId: string, sheetNamePattern: string): Promise<SheetPreview> {
  const workbook = await downloadWorkbook(sheetId);
  const availableSheetNames = workbook.worksheets.map((w) => w.name);
  const matched = findWorksheetByPattern(workbook, sheetNamePattern, new Date());
  const ws = matched ?? workbook.worksheets[0] ?? null;
  if (!ws) throw new SheetSyncError("File không có tab/sheet nào");

  const columns = Array.from({ length: MAX_PREVIEW_COLS }, (_, i) => colLetter(i + 1));
  const rows: SheetPreview["rows"] = [];
  const rowCount = Math.min(ws.rowCount, MAX_PREVIEW_ROWS);

  for (let r = 1; r <= rowCount; r++) {
    const row = ws.getRow(r);
    const cells: Record<string, SheetPreviewCell> = {};
    for (let c = 1; c <= MAX_PREVIEW_COLS; c++) {
      const cell = row.getCell(c);
      cells[colLetter(c)] = { value: cell.value != null ? String(cell.value) : "", color: cellRgb(cell) };
    }
    rows.push({ rowNumber: r, cells });
  }

  return {
    matchedSheetName: matched?.name ?? null,
    expectedSheetName: buildExpectedSheetName(sheetNamePattern, new Date()),
    availableSheetNames,
    columns,
    rows,
  };
}

function colLetterToIndex(letter: string): number {
  let n = 0;
  for (const ch of letter.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

// Dong bo 1 nguon: tai file, tim tab dung thang hien tai, voi moi villa/xe da anh xa
// (dayColumn/statusColumn) tim dong co gia tri dayColumn == ngay hien tai, doc mau o
// statusColumn tai dong do, cap nhat Place.availabilityStatus tuong ung.
export async function syncSheetSource(sourceId: string) {
  const source = await prisma.sheetSyncSource.findUnique({ where: { id: sourceId }, include: { mappings: true } });
  if (!source) throw new SheetSyncError("Không tìm thấy nguồn đồng bộ");

  try {
    const workbook = await downloadWorkbook(source.sheetId);
    const today = new Date();
    const ws = findWorksheetByPattern(workbook, source.sheetNamePattern, today);
    if (!ws) {
      throw new SheetSyncError(
        `Không tìm thấy tab tên "${buildExpectedSheetName(source.sheetNamePattern, today)}" trong file`
      );
    }

    const todayDay = today.getDate();
    const errors: string[] = [];

    for (const mapping of source.mappings) {
      const dayColIdx = colLetterToIndex(mapping.dayColumn);
      const statusColIdx = colLetterToIndex(mapping.statusColumn);

      let matchedRow: ExcelJS.Row | null = null;
      ws.eachRow((row) => {
        if (matchedRow) return;
        const dayValue = row.getCell(dayColIdx).value;
        const dayNum = typeof dayValue === "number" ? dayValue : parseInt(String(dayValue ?? ""), 10);
        if (dayNum === todayDay) matchedRow = row;
      });

      if (!matchedRow) {
        errors.push(`${mapping.label ?? mapping.placeId}: không tìm thấy dòng ngày ${todayDay}`);
        continue;
      }

      const statusCell = (matchedRow as ExcelJS.Row).getCell(statusColIdx);
      const status = classifyCellColor(cellRgb(statusCell));
      await prisma.place.update({ where: { id: mapping.placeId }, data: { availabilityStatus: status } });
    }

    await prisma.sheetSyncSource.update({
      where: { id: sourceId },
      data: { lastSyncedAt: new Date(), lastSyncError: errors.length > 0 ? errors.join("; ") : null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    await prisma.sheetSyncSource.update({ where: { id: sourceId }, data: { lastSyncError: message } });
    throw err;
  }
}

export async function syncAllSheetSources() {
  const sources = await prisma.sheetSyncSource.findMany({ select: { id: true } });
  for (const s of sources) {
    await syncSheetSource(s.id).catch(() => {});
  }
}
