import sanitizeHtml from "sanitize-html";

// Cac icon duoc phep dung trong khoi "thong tin nhanh" (QuickInfoBadges) - danh sach
// dong cung voi ICON_PALETTE trong component editor, chi cho phep dung nhung icon nay
// (khong cho class tuy y) de tranh admin/ke xau dung the <i class="..."> lam vector
// chen CSS la tu ben ngoai.
const QUICK_INFO_ICON_CLASSES = ["fa-solid", "fa-leaf", "fa-mountain", "fa-camera", "fa-heart", "fa-star", "fa-compass", "fa-sun", "fa-water"];

// Lam sach HTML tu rich-text editor TRUOC KHI luu vao DB - chan XSS neu tai khoan
// admin bi chiem hoac editor bi loi chen tag la. Chi cho phep cac tag/thuoc tinh that
// su can cho 1 bai viet (khong cho script/style/iframe/on* event...). "div"/"span" chi
// dung cho cac khoi dac biet (gallery anh, thong tin nhanh, video), class bi gioi han
// danh sach cu the - khong cho tuy y de tranh admin/no-le dung lam vector chen CSS la.
// "details"/"summary" dung cho khoi FAQ - la tag HTML chuan, tu co accordion khong can JS.
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4",
      "ul", "ol", "li", "a", "img", "blockquote", "div", "span", "details", "summary",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "data-align"],
      div: ["class", "data-type", "data-video-id"],
      span: ["class"],
      i: ["class", "aria-hidden"],
    },
    allowedClasses: {
      div: ["img-gallery", "cols-2", "cols-4", "cols-featured", "cols-3", "quick-info-badges", "video-embed", "faq-block", "testimonial-block"],
      span: ["quick-info-badge", "testimonial-author"],
      i: QUICK_INFO_ICON_CLASSES,
      details: ["faq-item"],
      summary: ["faq-question"],
      blockquote: ["testimonial-item"],
      p: ["faq-answer", "testimonial-quote"],
    },
    // data-video-id chi duoc giu lai neu la chuoi an toan (chu/so/gach ngang, dung
    // dinh dang ID YouTube) - phong truong hop attribute bi can thiep bat thuong.
    exclusiveFilter: (frame) => frame.tag === "div" && frame.attribs["data-video-id"] !== undefined && !/^[A-Za-z0-9_-]{6,20}$/.test(frame.attribs["data-video-id"]),
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}

// Bai viet cu (truoc khi co rich-text editor) luu noi dung dang PLAIN TEXT (khong co
// tag HTML). Neu render truc tiep bang dangerouslySetInnerHTML se mat het dong xuong
// dong. Ham nay phat hien truong hop do va boc lai thanh <p> cho de doc, con bai viet
// moi (da co tag HTML tu editor) thi giu nguyen.
export function toDisplayHtml(raw: string): string {
  if (raw.includes("<") && raw.includes(">")) return raw;
  const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
