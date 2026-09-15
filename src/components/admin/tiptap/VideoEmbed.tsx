"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

// Video YouTube nhung vao bai viet - CHI luu videoId (khong luu ca doan iframe HTML
// tu ben ngoai) vi ly do an toan: sanitize-html khong the tin cay "src" iframe tuy y
// tu rich-text, nen chi cho phep dung 1 nguon co dinh (youtube.com/embed/<id> do CHINH
// trang tu dung khi hien thi thuc, xem injectVideoEmbeds() trong article-content.ts) -
// admin chi dan link YouTube, ID duoc tach ra bang regex ngay tai day.
function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
  return match ? match[1] : null;
}

function VideoView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const videoId = node.attrs.videoId as string;

  function handlePaste(e: React.ChangeEvent<HTMLInputElement>) {
    const id = extractYoutubeId(e.target.value.trim());
    if (id) updateAttributes({ videoId: id });
  }

  if (!videoId) {
    return (
      <NodeViewWrapper className="my-3">
        <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/60">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Video YouTube</p>
          <input
            onChange={handlePaste}
            placeholder="Dán link YouTube (VD: https://www.youtube.com/watch?v=...)"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none"
          />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-brand-red text-xl">
            <i className="fa-solid fa-play" aria-hidden="true" />
          </span>
        </div>
        <button
          type="button"
          onClick={() => deleteNode()}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
        </button>
      </div>
    </NodeViewWrapper>
  );
}

const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      videoId: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return { videoId: dom.getAttribute("data-video-id") || "" };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    if (!node.attrs.videoId) return ["div", { style: "display:none" }];
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "video", "data-video-id": node.attrs.videoId, class: "video-embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
});

export default VideoEmbed;
