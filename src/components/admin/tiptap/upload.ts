// Ham upload dung chung cho moi noi trong rich-text editor can day anh len server
// (nut chen anh, dan/keo-tha anh, chen bo cuc gallery) - cung 1 endpoint voi ImageUploader.
export async function uploadEditorImage(file: File, folder: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.url === "string" ? data.url : null;
  } catch {
    return null;
  }
}
