// Kiểm tra "magic bytes" (chữ ký nhị phân) thực sự của file, KHÔNG chỉ tin vào
// Content-Type do client tự khai báo (dễ giả mạo - vd đổi file .html thành
// "image/png" trong FormData). Chỉ cần nhận diện đúng các định dạng thực tế app
// cho phép upload (ảnh/video phổ biến), không cần bao quát hết mọi định dạng trên đời.

function matches(buf: Buffer, offset: number, bytes: number[]): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

function matchesAscii(buf: Buffer, offset: number, text: string): boolean {
  return matches(buf, offset, Array.from(text).map((c) => c.charCodeAt(0)));
}

export function isValidImageSignature(buf: Buffer): boolean {
  if (matches(buf, 0, [0xff, 0xd8, 0xff])) return true; // JPEG
  if (matches(buf, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true; // PNG
  if (matchesAscii(buf, 0, "GIF87a") || matchesAscii(buf, 0, "GIF89a")) return true; // GIF
  if (matchesAscii(buf, 0, "RIFF") && matchesAscii(buf, 8, "WEBP")) return true; // WEBP
  if (matches(buf, 0, [0x42, 0x4d])) return true; // BMP
  return false;
}

export function isValidVideoSignature(buf: Buffer): boolean {
  if (matchesAscii(buf, 4, "ftyp")) return true; // MP4/MOV/M4V (ISO base media)
  if (matches(buf, 0, [0x1a, 0x45, 0xdf, 0xa3])) return true; // WEBM/MKV (EBML)
  if (matchesAscii(buf, 0, "RIFF") && matchesAscii(buf, 8, "AVI ")) return true; // AVI
  return false;
}
