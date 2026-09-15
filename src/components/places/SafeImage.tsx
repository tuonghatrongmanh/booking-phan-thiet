"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";

// Anh upload trong du an co the bi hong/rong (da gap thuc te voi du lieu seed cu) -
// next/image khong tu fallback khi file nguon rong nhung van tra ve status 200,
// nen can tu kiem tra naturalWidth sau khi "load" xong de phat hien truong hop nay.
// Ngoai ra neu anh loi rat nhanh (vd tu cache) truoc khi React kip gan listener thi
// su kien onError/onLoad co the da "chay qua" - nen phai tu kiem tra lai trang thai
// currentTarget.complete ngay khi mount de khong bo sot truong hop nay.
export default function SafeImage({ fallbackClassName, ...props }: ImageProps & { fallbackClassName?: string }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (broken) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-300 ${fallbackClassName ?? ""}`}>
        <i className="fa-regular fa-image text-2xl" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      ref={imgRef}
      onError={() => setBroken(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setBroken(true);
      }}
    />
  );
}
