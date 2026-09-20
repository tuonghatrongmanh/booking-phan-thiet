import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-action";
import { syncSheetSource } from "@/lib/sheet-sync";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/sheet-sync/[id]/sync - dong bo ngay theo yeu cau (ngoai vong lap
// dinh ky trong server.ts), dung khi admin vua sua anh xa xong muon thay ket qua lien.
export async function POST(_req: Request, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await syncSheetSource(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
