"use client";

import { needsTranslation, normalizeText, splitBatches, withOuterSpace } from "@/lib/translate-utils";

// Bộ dịch giao diện Việt -> Anh chạy trực tiếp trên trang: quét chữ hiển thị (không đụng tới ảnh), gửi
// các câu chưa có bản dịch lên /api/translate (Gemini, có cache dùng chung), rồi thay chữ tại chỗ.
// Chỉ đổi giá trị text node/thuộc tính nên React không bị vỡ; nội dung mới (chuyển trang, tải thêm) được
// bắt bằng MutationObserver. Trả về hàm dừng + khôi phục tiếng Việt.
const CACHE_KEY = "bpt_tr_en_v1";
const MAX_CACHE = 3000;
const SKIP = "script,style,noscript,textarea,code,pre,svg,[contenteditable='true'],[data-no-translate],[translate='no']";
const ATTRS = ["placeholder", "title", "aria-label"] as const;

type State = { orig: string; tr: string };
type AttrRef = { el: Element; name: string };

function loadCache(): Map<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return new Map(raw ? (Object.entries(JSON.parse(raw)) as [string, string][]) : []);
  } catch {
    return new Map();
  }
}

export function startTranslator(onBusy: (busy: boolean) => void): () => void {
  const mem = loadCache();
  const textState = new WeakMap<Text, State>();
  const attrState = new WeakMap<Element, Record<string, State>>();
  const tracked = new Set<Text>();
  const trackedAttrs = new Set<AttrRef>();
  const waitingText = new Map<string, Set<Text>>();
  const waitingAttr = new Map<string, Set<AttrRef>>();
  const waitingTitle = new Set<string>();
  const tries = new Map<string, number>();
  let titleOrig = "";
  let titleTr = "";
  let inflight = false;
  let stopped = false;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let scanTimer: ReturnType<typeof setTimeout> | undefined;
  const queue = new Set<Node>();

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const entries = [...mem.entries()].slice(-MAX_CACHE);
        localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
      } catch {
        // đầy bộ nhớ trình duyệt - bỏ qua, vẫn dịch được qua server
      }
    }, 800);
  }

  function setText(node: Text, tr: string) {
    const value = node.nodeValue ?? "";
    const next = withOuterSpace(value, tr);
    textState.set(node, { orig: value, tr: next });
    tracked.add(node);
    node.nodeValue = next;
  }

  function setAttr(ref: AttrRef, tr: string) {
    const value = ref.el.getAttribute(ref.name) ?? "";
    const states = attrState.get(ref.el) ?? {};
    states[ref.name] = { orig: value, tr };
    attrState.set(ref.el, states);
    trackedAttrs.add(ref);
    ref.el.setAttribute(ref.name, tr);
  }

  function wait<T>(map: Map<string, Set<T>>, key: string, item: T) {
    const set = map.get(key) ?? new Set<T>();
    set.add(item);
    map.set(key, set);
  }

  function handleText(node: Text) {
    if (!node.parentElement || node.parentElement.closest(SKIP)) return;
    const value = node.nodeValue ?? "";
    const st = textState.get(node);
    if (st && value === st.tr) return;
    const key = normalizeText(value);
    if (!needsTranslation(key)) return;
    const hit = mem.get(key);
    if (hit) setText(node, hit);
    else wait(waitingText, key, node);
  }

  function handleAttr(el: Element, name: string) {
    if (el.closest(SKIP)) return;
    const value = el.getAttribute(name) ?? "";
    const st = attrState.get(el)?.[name];
    if (st && value === st.tr) return;
    const key = normalizeText(value);
    if (!needsTranslation(key)) return;
    const hit = mem.get(key);
    const ref = { el, name };
    if (hit) setAttr(ref, hit);
    else wait(waitingAttr, key, ref);
  }

  function scan(root: Node) {
    if (root.nodeType === Node.TEXT_NODE) {
      handleText(root as Text);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) handleText(n as Text);
    const scope = root.nodeType === Node.DOCUMENT_NODE ? (root as Document).documentElement : (root as Element);
    const els = [scope, ...scope.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(","))];
    for (const el of els) for (const a of ATTRS) if (el.hasAttribute(a)) handleAttr(el, a);
  }

  function setTitle(tr: string) {
    titleOrig = document.title;
    titleTr = tr;
    document.title = tr;
  }

  function translateTitle() {
    const key = normalizeText(document.title);
    if (!needsTranslation(key)) return;
    const hit = mem.get(key);
    if (hit) setTitle(hit);
    else waitingTitle.add(key);
  }

  function applyWaiting(key: string) {
    const tr = mem.get(key);
    if (!tr) return;
    for (const node of waitingText.get(key) ?? []) {
      if (node.isConnected && normalizeText(node.nodeValue ?? "") === key) setText(node, tr);
    }
    for (const ref of waitingAttr.get(key) ?? []) {
      if (ref.el.isConnected && normalizeText(ref.el.getAttribute(ref.name) ?? "") === key) setAttr(ref, tr);
    }
    waitingText.delete(key);
    waitingAttr.delete(key);
    if (waitingTitle.delete(key) && normalizeText(document.title) === key) setTitle(tr);
  }

  async function flush() {
    if (inflight || stopped) return;
    const all = [...waitingText.keys(), ...waitingAttr.keys(), ...waitingTitle];
    const keys = all.filter((k, i) => all.indexOf(k) === i && !mem.has(k) && (tries.get(k) ?? 0) < 3);
    if (keys.length === 0) {
      onBusy(false);
      return;
    }
    inflight = true;
    onBusy(true);
    for (const batch of splitBatches(keys)) {
      if (stopped) break;
      let ok = false;
      try {
        const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texts: batch }) });
        if (res.ok) {
          const { translations } = (await res.json()) as { translations: Record<string, string> };
          for (const [k, v] of Object.entries(translations)) mem.set(k, v);
          ok = true;
        }
      } catch {
        // mạng lỗi - thử lại lần sau
      }
      for (const k of batch) {
        if (!mem.has(k)) tries.set(k, (tries.get(k) ?? 0) + 1);
        applyWaiting(k);
      }
      persist();
      if (!ok) await new Promise((r) => setTimeout(r, 2500));
    }
    inflight = false;
    if (!stopped) setTimeout(flush, 300);
  }

  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      for (const n of queue) if (n.isConnected) scan(n);
      queue.clear();
      translateTitle();
      void flush();
    }, 150);
  }

  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "childList") r.addedNodes.forEach((n) => queue.add(n));
      else if (r.type === "characterData") queue.add(r.target);
      else if (r.type === "attributes" && r.target instanceof Element) queue.add(r.target);
    }
    scheduleScan();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });

  document.documentElement.lang = "en";
  scan(document);
  translateTitle();
  void flush();

  return () => {
    stopped = true;
    observer.disconnect();
    clearTimeout(scanTimer);
    clearTimeout(saveTimer);
    document.documentElement.lang = "vi";
    if (titleTr && document.title === titleTr) document.title = titleOrig;
    // khôi phục tiếng Việt cho mọi nơi đã dịch
    for (const node of tracked) {
      const st = textState.get(node);
      if (st && node.nodeValue === st.tr) node.nodeValue = st.orig;
    }
    for (const ref of trackedAttrs) {
      const st = attrState.get(ref.el)?.[ref.name];
      if (st && ref.el.getAttribute(ref.name) === st.tr) ref.el.setAttribute(ref.name, st.orig);
    }
    tracked.clear();
    trackedAttrs.clear();
    onBusy(false);
  };
}
