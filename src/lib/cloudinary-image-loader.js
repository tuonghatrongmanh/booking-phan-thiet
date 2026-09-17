"use client";

// Bo qua trinh toi uu anh cua Next.js (chay tren server Render, CPU yeu, gay
// cham lan dau khi ai vao web) - chuyen thang sang Cloudinary CDN de resize/toi
// uu anh (Cloudinary da co CDN toan cau, nhanh hon nhieu so voi tu xu ly tren Render).
// Anh tinh/local (khong phai Cloudinary) khong resize duoc nhung Next.js van yeu cau
// URL loader phai the hien "width" - gan them query string vo hai (server bo qua).
export default function cloudinaryImageLoader({ src, width, quality }) {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const q = quality || "auto";
    return src.replace("/upload/", `/upload/f_auto,q_${q},w_${width}/`);
  }
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}`;
}
