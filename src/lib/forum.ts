export const FORUM_CATEGORIES = {
  "nghi-duong": {
    enum: "NGHI_DUONG",
    label: "Nghỉ dưỡng",
    desc: "Cộng đồng chia sẻ Homestay, Villa, Khu du lịch tại Phan Thiết",
    icon: "fa-solid fa-house",
    bannerImage: "/images/banner-forum.png",
  },
  "quan-nhau": {
    enum: "QUAN_NHAU",
    label: "Quán nhậu",
    desc: "Chia sẻ, hỏi đáp về quán nhậu tại Phan Thiết",
    icon: "fa-solid fa-beer-mug-empty",
    bannerImage: "/images/banner-forum.png",
  },
  "quan-ca-phe": {
    enum: "QUAN_CA_PHE",
    label: "Quán cà phê",
    desc: "Chia sẻ, hỏi đáp về quán cà phê tại Phan Thiết",
    icon: "fa-solid fa-mug-hot",
    bannerImage: "/images/banner-forum.png",
  },
} as const;

export type ForumSlug = keyof typeof FORUM_CATEGORIES;

export function isForumSlug(slug: string): slug is ForumSlug {
  return slug in FORUM_CATEGORIES;
}

export function slugToEnum(slug: ForumSlug) {
  return FORUM_CATEGORIES[slug].enum;
}

const ENUM_TO_SLUG: Record<string, ForumSlug> = Object.fromEntries(
  (Object.keys(FORUM_CATEGORIES) as ForumSlug[]).map((slug) => [FORUM_CATEGORIES[slug].enum, slug])
);

export function enumToSlug(value: string): ForumSlug {
  return ENUM_TO_SLUG[value];
}

export const POST_TYPES = {
  POST: { label: "Bài viết", icon: "fa-solid fa-file-lines" },
  REVIEW: { label: "Đánh giá", icon: "fa-solid fa-star" },
  QUESTION: { label: "Hỏi đáp", icon: "fa-solid fa-circle-question" },
  EXPERIENCE: { label: "Kinh nghiệm", icon: "fa-solid fa-suitcase-rolling" },
} as const;

export type PostTypeKey = keyof typeof POST_TYPES;

export const REACTION_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  LIKE: { icon: "fa-solid fa-thumbs-up", label: "Thích", color: "#1a6fc4" },
  LOVE: { icon: "fa-solid fa-heart", label: "Yêu thích", color: "#e8483a" },
  HAHA: { icon: "fa-solid fa-face-laugh-beam", label: "Haha", color: "#ffc72c" },
  WOW: { icon: "fa-solid fa-face-surprise", label: "Wow", color: "#ffc72c" },
  SAD: { icon: "fa-solid fa-face-sad-tear", label: "Buồn", color: "#ffc72c" },
  ANGRY: { icon: "fa-solid fa-face-angry", label: "Phẫn nộ", color: "#e8483a" },
};

// Trích #hashtag từ nội dung bài viết (hỗ trợ tiếng Việt có dấu)
export function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const unique = new Set(matches.map((m) => m.slice(1).toLowerCase()));
  return [...unique].slice(0, 10);
}
