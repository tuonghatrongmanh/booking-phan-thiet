import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/request-log";
import { rateLimit } from "@/lib/rate-limit";
import { isWav } from "@/lib/audio-utils";
import { MAX_AUDIO_BYTES, MIN_AUDIO_BYTES, transcribeWav } from "@/lib/speech-to-text";

// POST /api/speech-to-text (body = file WAV) -> { text }. Dùng cho nút micro: trình duyệt ghi âm,
// tự nhận biết lúc người dùng ngừng nói rồi gửi đoạn ghi âm lên đây để chuyển thành chữ.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`stt:min:${ip}`, 12, 60_000) || !rateLimit(`stt:hour:${ip}`, 100, 3_600_000)) {
    return NextResponse.json({ error: "Bạn nói hơi nhanh, chờ chút rồi thử lại nhé" }, { status: 429 });
  }

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_AUDIO_BYTES) return NextResponse.json({ error: "Đoạn ghi âm quá dài" }, { status: 413 });

  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.length > MAX_AUDIO_BYTES) return NextResponse.json({ error: "Đoạn ghi âm quá dài" }, { status: 413 });
  if (buf.length < MIN_AUDIO_BYTES || !isWav(buf)) return NextResponse.json({ error: "Đoạn ghi âm không hợp lệ" }, { status: 400 });

  const result = await transcribeWav(Buffer.from(buf));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ text: result.text });
}
