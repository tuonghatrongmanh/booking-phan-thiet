"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

// Khoi "trich dan khach hang" - mirror dung kien truc FaqBlock.tsx (atom Node + React
// NodeView de admin them/xoa nhieu trich dan ngay trong editor). Dung cho yeu cau
// "trich cac dan chung tu nguoi da thuong thuc" tren bai viet chi tiet mon an.
type TestimonialItem = { quote: string; author: string };

function TestimonialView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items = (node.attrs.items as TestimonialItem[]) || [];

  function update(i: number, field: "quote" | "author", value: string) {
    const next = items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it));
    updateAttributes({ items: next });
  }
  function addItem() {
    updateAttributes({ items: [...items, { quote: "", author: "" }] });
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
      <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/60 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Trích dẫn khách hàng</p>
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <textarea
                value={item.quote}
                onChange={(e) => update(i, "quote", e.target.value)}
                placeholder="Nội dung trích dẫn..."
                rows={2}
                className="flex-1 text-sm outline-none resize-none"
              />
              <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-brand-red shrink-0">
                <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
              </button>
            </div>
            <input
              value={item.author}
              onChange={(e) => update(i, "author", e.target.value)}
              placeholder="Tên người chia sẻ (VD: Minh Anh, khách du lịch)"
              className="w-full text-sm font-bold outline-none text-slate-600"
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-xs font-bold text-brand-blue hover:underline">
          + Thêm trích dẫn
        </button>
      </div>
    </NodeViewWrapper>
  );
}

const TestimonialBlock = Node.create({
  name: "testimonialBlock",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      items: { default: [{ quote: "", author: "" }] as TestimonialItem[] },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="testimonial"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const items = Array.from(dom.querySelectorAll("blockquote.testimonial-item")).map((el) => ({
            quote: el.querySelector(".testimonial-quote")?.textContent?.trim() || "",
            author: el.querySelector(".testimonial-author")?.textContent?.replace(/^—\s*/, "").trim() || "",
          }));
          return { items: items.length ? items : [{ quote: "", author: "" }] };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = ((node.attrs.items as TestimonialItem[]) || []).filter((it) => it.quote.trim());
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "testimonial", class: "testimonial-block" }),
      ...items.map((it) => [
        "blockquote",
        { class: "testimonial-item" },
        ["p", { class: "testimonial-quote" }, it.quote],
        ["span", { class: "testimonial-author" }, `— ${it.author}`],
      ]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TestimonialView);
  },
});

export default TestimonialBlock;
