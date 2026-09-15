export type MediaItem = { url: string; type: "IMAGE" | "VIDEO" };

// Upload 1 file len /api/upload, dung chung cho MediaUploader va paste-anh-truc-tiep
export async function uploadFile(file: File, folder = "forum"): Promise<MediaItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Tải lên thất bại");

  return { url: data.url, type: data.type === "VIDEO" ? "VIDEO" : "IMAGE" };
}
