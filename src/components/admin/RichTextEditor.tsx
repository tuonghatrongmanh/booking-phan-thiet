"use client";

import { useCallback, useRef } from "react";
import { useDialog } from "@/components/ui/DialogProvider";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import EditorImage from "@/components/admin/tiptap/EditorImage";
import ImageGallery from "@/components/admin/tiptap/ImageGallery";
import QuickInfoBadges from "@/components/admin/tiptap/QuickInfoBadges";
import FaqBlock from "@/components/admin/tiptap/FaqBlock";
import TestimonialBlock from "@/components/admin/tiptap/TestimonialBlock";
import VideoEmbed from "@/components/admin/tiptap/VideoEmbed";
import { uploadEditorImage } from "@/components/admin/tiptap/upload";

// Soan thao kieu Word cho noi dung bai viet - chi cho phep H2/H3 (KHONG co H1, vi
// tieu de bai viet o ngoai da la H1 duy nhat cua trang, xem SectionHeader/H1 o trang
// chi tiet). Anh chen vao dung lai /api/upload (cung endpoint voi ImageUploader).
// Ho tro them: dan anh tu clipboard, keo-tha anh, xoa/can chinh anh (EditorImage),
// bo cuc anh nhieu tam 2/4 cot (ImageGallery).
export default function RichTextEditor({
  value,
  onChange,
  uploadFolder = "news",
}: {
  value: string;
  onChange: (html: string) => void;
  uploadFolder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingGalleryColumns = useRef<number | "featured">(2);
  const { toast } = useDialog();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      EditorImage.configure({ HTMLAttributes: { class: "rounded-xl" } }),
      ImageGallery,
      QuickInfoBadges,
      FaqBlock,
      TestimonialBlock,
      VideoEmbed,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[240px] focus:outline-none",
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((it) => it.type.startsWith("image/"));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        uploadEditorImage(file, uploadFolder).then((url) => {
          if (!url) return;
          const node = view.state.schema.nodes.image.create({ src: url, alt: "" });
          view.dispatch(view.state.tr.replaceSelectionWith(node));
        });
        return true;
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;
        event.preventDefault();
        uploadEditorImage(file, uploadFolder).then((url) => {
          if (!url) return;
          const node = view.state.schema.nodes.image.create({ src: url, alt: "" });
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          const tr = view.state.tr.insert(coords?.pos ?? view.state.selection.from, node);
          view.dispatch(tr);
        });
        return true;
      },
    },
  });

  const handleImagePick = useCallback(() => fileInputRef.current?.click(), []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    const alt = window.prompt("Mô tả ảnh (thẻ Alt) - giúp SEO và người khiếm thị:", "") ?? "";
    const url = await uploadEditorImage(file, uploadFolder);
    if (!url) {
      toast("Tải ảnh thất bại", "error");
      return;
    }
    editor.chain().focus().setImage({ src: url, alt }).run();
  }

  const handleGalleryPick = useCallback((columns: number | "featured") => {
    pendingGalleryColumns.current = columns;
    galleryInputRef.current?.click();
  }, []);

  async function handleGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0 || !editor) return;

    const uploaded = await Promise.all(files.map((f) => uploadEditorImage(f, uploadFolder)));
    const urls = uploaded.filter((u): u is string => !!u);
    if (urls.length === 0) {
      toast("Tải ảnh thất bại", "error");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({ type: "imageGallery", attrs: { columns: pendingGalleryColumns.current, images: urls } })
      .run();
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập liên kết (VD: /tin-tuc/bai-viet-khac hoặc https://...):", previous ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
      active ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-slate-100"
    }`;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/40">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        <button type="button" title="In đậm" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
          <i className="fa-solid fa-bold" aria-hidden="true" />
        </button>
        <button type="button" title="In nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
          <i className="fa-solid fa-italic" aria-hidden="true" />
        </button>
        <button type="button" title="Gạch chân" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))}>
          <i className="fa-solid fa-underline" aria-hidden="true" />
        </button>
        <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />
        <button type="button" title="Tiêu đề H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>
          H2
        </button>
        <button type="button" title="Tiêu đề H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>
          H3
        </button>
        <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />
        <button type="button" title="Danh sách gạch đầu dòng" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
          <i className="fa-solid fa-list-ul" aria-hidden="true" />
        </button>
        <button type="button" title="Danh sách đánh số" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>
          <i className="fa-solid fa-list-ol" aria-hidden="true" />
        </button>
        <button type="button" title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))}>
          <i className="fa-solid fa-quote-right" aria-hidden="true" />
        </button>
        <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />
        <button type="button" title="Chèn liên kết" onClick={setLink} className={btnClass(editor.isActive("link"))}>
          <i className="fa-solid fa-link" aria-hidden="true" />
        </button>
        <button type="button" title="Chèn 1 ảnh" onClick={handleImagePick} className={btnClass(false)}>
          <i className="fa-solid fa-image" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Chèn bố cục ảnh 2 cột"
          onClick={() => handleGalleryPick(2)}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-table-cells" aria-hidden="true" /> 2
        </button>
        <button
          type="button"
          title="Chèn gallery 3 cột (dạng Instagram)"
          onClick={() => handleGalleryPick(3)}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-table-cells" aria-hidden="true" /> 3
        </button>
        <button
          type="button"
          title="Chèn bố cục ảnh 4 cột"
          onClick={() => handleGalleryPick(4)}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-table-cells-large" aria-hidden="true" /> 4
        </button>
        <button
          type="button"
          title="Chèn bố cục ảnh nổi bật (1 lớn + nhỏ)"
          onClick={() => handleGalleryPick("featured")}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-images" aria-hidden="true" /> Nổi bật
        </button>
        <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />
        <button
          type="button"
          title="Chèn khối thông tin nhanh (badge có icon)"
          onClick={() => editor.chain().focus().insertContent({ type: "quickInfoBadges", attrs: { items: ["", "", "", ""] } }).run()}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-icons" aria-hidden="true" /> Thông tin nhanh
        </button>
        <button
          type="button"
          title="Chèn khối câu hỏi thường gặp (FAQ)"
          onClick={() => editor.chain().focus().insertContent({ type: "faqBlock", attrs: { items: [{ q: "", a: "" }] } }).run()}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-circle-question" aria-hidden="true" /> FAQ
        </button>
        <button
          type="button"
          title="Chèn trích dẫn khách hàng"
          onClick={() => editor.chain().focus().insertContent({ type: "testimonialBlock", attrs: { items: [{ quote: "", author: "" }] } }).run()}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-solid fa-quote-right" aria-hidden="true" /> Trích dẫn
        </button>
        <button
          type="button"
          title="Chèn video YouTube"
          onClick={() => editor.chain().focus().insertContent({ type: "videoEmbed", attrs: { videoId: "" } }).run()}
          className={`${btnClass(false)} w-auto px-2 gap-1 text-xs font-bold`}
        >
          <i className="fa-brands fa-youtube" aria-hidden="true" /> Video
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFiles} />
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
      <p className="text-[11px] text-slate-400 px-4 pb-2.5 -mt-1">
        Mẹo: bạn có thể dán (Ctrl+V) hoặc kéo-thả ảnh trực tiếp vào khung nội dung.
      </p>
    </div>
  );
}
