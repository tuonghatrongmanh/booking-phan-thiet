"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

// Khoi FAQ (cau hoi thuong gap) - render bang <details>/<summary> chuan HTML, tu co
// hieu ung accordion (mo/dong) ma KHONG can JavaScript o trang cong khai - vua don
// gian, vua tot cho SEO/accessibility hon la tu viet accordion bang React state.
type FaqItem = { q: string; a: string };

function FaqView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items = (node.attrs.items as FaqItem[]) || [];

  function update(i: number, field: "q" | "a", value: string) {
    const next = items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it));
    updateAttributes({ items: next });
  }
  function addItem() {
    updateAttributes({ items: [...items, { q: "", a: "" }] });
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
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Câu hỏi thường gặp</p>
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={item.q}
                onChange={(e) => update(i, "q", e.target.value)}
                placeholder="Câu hỏi..."
                className="flex-1 text-sm font-bold outline-none"
              />
              <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-brand-red shrink-0">
                <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
              </button>
            </div>
            <textarea
              value={item.a}
              onChange={(e) => update(i, "a", e.target.value)}
              placeholder="Câu trả lời..."
              rows={2}
              className="w-full text-sm outline-none text-slate-600 resize-none"
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-xs font-bold text-brand-blue hover:underline">
          + Thêm câu hỏi
        </button>
      </div>
    </NodeViewWrapper>
  );
}

const FaqBlock = Node.create({
  name: "faqBlock",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      items: { default: [{ q: "", a: "" }] as FaqItem[] },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="faq"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const items = Array.from(dom.querySelectorAll("details.faq-item")).map((el) => ({
            q: el.querySelector("summary")?.textContent?.trim() || "",
            a: el.querySelector("p")?.textContent?.trim() || "",
          }));
          return { items: items.length ? items : [{ q: "", a: "" }] };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = ((node.attrs.items as FaqItem[]) || []).filter((it) => it.q.trim());
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "faq", class: "faq-block" }),
      ...items.map((it) => ["details", { class: "faq-item" }, ["summary", { class: "faq-question" }, it.q], ["p", { class: "faq-answer" }, it.a]]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqView);
  },
});

export default FaqBlock;
