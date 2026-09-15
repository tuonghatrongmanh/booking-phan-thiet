"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

// Khoi "thong tin nhanh" - day cac badge ngang co icon, dap ung phan "khoi thong tin
// nhanh dang 4 box nam ngang" trong thiet ke tham khao (khac voi danh sach checklist
// don gian). Icon duoc gan TU DONG theo vi tri (khong can admin chon) de don gian hoa
// UI soan thao - cung 1 bang icon dung ca luc soan (component nay) va luc luu HTML
// that (xem sanitize-html.ts) nen admin thay dung y het khach se thay.
export const ICON_PALETTE = ["fa-leaf", "fa-mountain", "fa-camera", "fa-heart", "fa-star", "fa-compass", "fa-sun", "fa-water"];

function QuickInfoView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items = (node.attrs.items as string[]) || [];

  function updateItem(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    updateAttributes({ items: next });
  }
  function addItem() {
    updateAttributes({ items: [...items, ""] });
  }
  function removeItem(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    if (next.length === 0) {
      deleteNode();
      return;
    }
    updateAttributes({ items: next });
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/60">
        <div className="flex flex-wrap gap-2 mb-2.5">
          {items.map((text, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-3 pr-1.5 py-1.5">
              <i className={`fa-solid ${ICON_PALETTE[i % ICON_PALETTE.length]} text-brand-blue text-xs`} aria-hidden="true" />
              <input
                value={text}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder="Nội dung ngắn gọn..."
                className="text-sm outline-none w-36"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0"
              >
                <i className="fa-solid fa-xmark text-[10px] text-slate-400" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={addItem} className="text-xs font-bold text-brand-blue hover:underline">
            + Thêm mục
          </button>
          <button type="button" onClick={() => deleteNode()} className="text-xs font-bold text-brand-red hover:underline">
            Xóa cả khối
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const QuickInfoBadges = Node.create({
  name: "quickInfoBadges",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      items: { default: ["", "", "", ""] as string[] },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quick-info"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const items = Array.from(dom.querySelectorAll("span.quick-info-badge")).map(
            (el) => el.textContent?.trim() || ""
          );
          return { items: items.length ? items : ["", "", "", ""] };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = ((node.attrs.items as string[]) || []).filter((t) => t.trim());
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "quick-info", class: "quick-info-badges" }),
      ...items.map((text, i) => [
        "span",
        { class: "quick-info-badge" },
        ["i", { class: `fa-solid ${ICON_PALETTE[i % ICON_PALETTE.length]}`, "aria-hidden": "true" }],
        text,
      ]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuickInfoView);
  },
});

export default QuickInfoBadges;
