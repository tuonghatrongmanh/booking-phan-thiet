"use client";

import { useEffect, useState, type ElementType } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// Doc ban dich cua 1 ban ghi (bai viet/mo ta...) da duoc dich san va luu trong DB tu
// truoc (luc admin luu bai) - o day CHI doc, khong goi Google Translate. Neu locale la
// "vi" hoac chua co ban dich (vd bai moi dang, dich nen (background job) chua kip xong)
// thi tu dong fallback ve dung noi dung tieng Viet goc, khong bao gio de trong/loi.
export function useTranslatedFields(model: string, recordId: string): Record<string, string> {
  const { locale } = useLanguage();
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (locale === "vi") {
      setFields({});
      return;
    }
    let cancelled = false;
    fetch(`/api/translations?model=${encodeURIComponent(model)}&recordId=${encodeURIComponent(recordId)}&locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setFields(d.fields ?? {});
      })
      .catch(() => {
        if (!cancelled) setFields({});
      });
    return () => {
      cancelled = true;
    };
  }, [locale, model, recordId]);

  return fields;
}

export default function TranslatedField({
  model,
  recordId,
  field,
  children,
  as: Tag = "span",
  className,
}: {
  model: string;
  recordId: string;
  field: string;
  children: string;
  as?: ElementType;
  className?: string;
}) {
  const fields = useTranslatedFields(model, recordId);
  const text = fields[field] ?? children;
  return <Tag className={className}>{text}</Tag>;
}
