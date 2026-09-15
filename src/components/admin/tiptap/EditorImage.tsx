"use client";

import TiptapImage from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

// Anh chen trong bai viet - mo rong Image mac dinh de them: nut xoa (hien khi hover,
// tra loi truc tiep yeu cau "xoa anh" con thieu), va can trai/giua/phai/full-width
// (luu vao thuoc tinh data-align tren the <img> that su, khong phai chi trang tri
// trong editor - de trang cong khai render dung y het nhu admin thay).
function ImageView({ node, deleteNode, updateAttributes, selected }: NodeViewProps) {
  const align = (node.attrs.align as string) || "center";

  return (
    <NodeViewWrapper
      className={`editor-image-node my-2 ${align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center"}`}
    >
      <div className={`relative inline-block group max-w-full ${selected ? "ring-2 ring-brand-blue rounded-lg" : ""}`}>
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          className={`rounded-xl ${align === "full" ? "w-full" : "max-h-[360px]"}`}
        />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {(["left", "center", "right", "full"] as const).map((a) => (
            <button
              key={a}
              type="button"
              title={a === "left" ? "Căn trái" : a === "center" ? "Căn giữa" : a === "right" ? "Căn phải" : "Full chiều ngang"}
              onClick={() => updateAttributes({ align: a })}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shadow ${
                align === a ? "bg-brand-blue text-white" : "bg-white/90 text-slate-600 hover:bg-white"
              }`}
            >
              <i
                className={`fa-solid ${
                  a === "left" ? "fa-align-left" : a === "center" ? "fa-align-center" : a === "right" ? "fa-align-right" : "fa-arrows-left-right"
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
          <button
            type="button"
            title="Xóa ảnh"
            onClick={() => deleteNode()}
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs bg-brand-red text-white shadow hover:brightness-95"
          >
            <i className="fa-solid fa-trash" aria-hidden="true" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const EditorImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

export default EditorImage;
