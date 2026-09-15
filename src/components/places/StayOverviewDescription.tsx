"use client";

import { useState } from "react";
import { useTranslatedFields } from "@/components/i18n/TranslatedField";

export default function StayOverviewDescription({ placeId, description }: { placeId: string; description: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const translated = useTranslatedFields("Place", placeId);
  const text = translated.description ?? description;

  if (!text) {
    return <p className="text-base text-[#8297AC]">Chủ nhà chưa cập nhật mô tả chi tiết cho chỗ nghỉ này.</p>;
  }

  const isLong = text.length > 240;

  return (
    <div>
      <p className={`text-base text-[#47647F] leading-[1.8] whitespace-pre-line ${!expanded && isLong ? "line-clamp-3" : ""}`}>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-bold text-[#168BE0] hover:underline mt-1.5 flex items-center gap-1"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
          <i className={`fa-solid fa-chevron-down text-xs transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
