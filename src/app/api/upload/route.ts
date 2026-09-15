import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import cloudinary from "@/lib/cloudinary";

// Chưa cấu hình Cloudinary (.env trống) -> lưu tạm vào public/uploads để test local
const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

// POST /api/upload - upload 1 ảnh lên Cloudinary, tra ve { url }
// Dung cho toan bo anh: avatar, sale, cover tin tuc, comment mang xa hoi...
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  if (!rateLimit(`upload:${actor.id}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Bạn tải lên quá nhanh, vui lòng thử lại sau ít phút" },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "booking-phan-thiet";

  if (!file) {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "File phải là hình ảnh hoặc video" }, { status: 400 });
  }

  const maxSize = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024; // video 50MB, ảnh 8MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: isVideo ? "Video vượt quá 50MB" : "Ảnh vượt quá 8MB" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!CLOUDINARY_CONFIGURED) {
    try {
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return NextResponse.json({
        url: `/uploads/${folder}/${filename}`,
        publicId: filename,
        type: isVideo ? "VIDEO" : "IMAGE",
      });
    } catch (err) {
      console.error("Local upload error", err);
      return NextResponse.json({ error: "Upload thất bại" }, { status: 500 });
    }
  }

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: isVideo ? "video" : "image" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id, type: isVideo ? "VIDEO" : "IMAGE" });
  } catch (err) {
    console.error("Cloudinary upload error", err);
    return NextResponse.json({ error: "Upload thất bại" }, { status: 500 });
  }
}
