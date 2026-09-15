"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useRef } from "react";
import { uploadEditorImage } from "./upload";

// Khoi "bo cuc anh" nhieu tam xep 2 hoac 4 cot - dap ung dung yeu cau con thieu:
// "lua chon bo cuc anh 2 cot hoac 4 cot". Luu duoi dang 1 node atom voi attrs
// {columns, images[]} - render ra <div class="img-gallery cols-N"><img/>...</div>,
// khop voi CSS .img-gallery dung chung o globals.css cho ca editor lan trang cong khai.
function GalleryView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const columns = (node.attrs.columns as number | "featured") || 2;
  const images = (node.attrs.images as string[]) || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    if (next.length === 0) {
      deleteNode();
      return;
    }
    updateAttributes({ images: next });
  }

  async function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const uploaded = await Promise.all(files.map((f) => uploadEditorImage(f, "news")));
    const urls = uploaded.filter((u): u is string => !!u);
    if (urls.length > 0) updateAttributes({ images: [...images, ...urls] });
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="border border-dashed border-slate-300 rounded-xl p-2.5 bg-slate-50/60">
        <div className={`img-gallery cols-${columns}`}>
          {images.map((src, i) => (
            <div key={src + i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              <button
                type="button"
                title="Xóa ảnh này"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-brand-red text-white text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200">
          <div className="flex gap-1">
            {([2, 3, 4, "featured"] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateAttributes({ columns: n })}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  columns === n ? "bg-brand-blue text-white" : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                {n === "featured" ? "Nổi bật" : `${n} cột`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              + Thêm ảnh
            </button>
            <button type="button" onClick={() => deleteNode()} className="text-xs font-bold text-brand-red hover:underline">
              Xóa cả khối
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddFiles} />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const ImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      columns: { default: 2 },
      images: { default: [] as string[] },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const images = Array.from(dom.querySelectorAll("img")).map((img) => img.getAttribute("src") || "");
          const match = dom.className.match(/cols-(\d+|featured)/);
          const columns = match ? (match[1] === "featured" ? "featured" : Number(match[1])) : 2;
          return { columns, images };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const columns = node.attrs.columns || 2;
    const images = (node.attrs.images as string[]) || [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "image-gallery", class: `img-gallery cols-${columns}` }),
      ...images.map((src) => ["img", { src, alt: "" }]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryView);
  },
});

export default ImageGallery;
