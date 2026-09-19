import Link from "next/link";
import type { ReactNode } from "react";

// Hien thi cau tra loi cua AI an toan: KHONG dung dangerouslySetInnerHTML. Chi ho tro
// **dam**, [chu](https://...) (chi https) va (/duong-dan-noi-bo) -> link noi bo, cung dong
// dau dong "- "/"* " -> danh sach. Moi thu khac hien nguyen van ban.
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https:\/\/[^)\s]+|\/[a-z0-9\-/]+)\)|\(\/[a-z0-9\-/]+\))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    const md = part.match(/^\[([^\]]+)\]\((\/[a-z0-9\-/]+)\)$/);
    if (md) {
      return (
        <Link key={key} href={md[2]} className="text-brand-blue font-semibold underline">
          {md[1]}
        </Link>
      );
    }
    const ext = part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/);
    if (ext) {
      return (
        <a key={key} href={ext[2]} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-blue font-semibold underline">
          {ext[1]}
        </a>
      );
    }
    const internal = part.match(/^\((\/[a-z0-9\-/]+)\)$/);
    if (internal) {
      return (
        <Link key={key} href={internal[1]} className="text-brand-blue font-semibold underline">
          {internal[1]}
        </Link>
      );
    }
    return part;
  });
}

export default function ChatText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trimEnd());
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-1">
        {items.map((it, i) => (
          <li key={i}>{renderInline(it, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((line, idx) => {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList();
    if (line.trim() === "") return;
    blocks.push(
      <p key={`p-${idx}`} className="my-1 first:mt-0 last:mb-0">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });
  flushList();

  return <div>{blocks}</div>;
}
