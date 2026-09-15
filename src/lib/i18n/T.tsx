"use client";

import { useLanguage } from "./LanguageProvider";

// Component dich text nho, dat truc tiep trong cay Server Component: <T id="nav.home">Trang chủ</T>
// - children la chu tieng Viet mac dinh (dong thoi la fallback khi thieu ban dich),
// id la key tra trong dictionary cho 6 ngon ngu con lai. Nho vay KHONG can 1 dictionary
// tieng Viet rieng, va khong bao gio hien rong/loi neu quen dich 1 key nao do.
export default function T({ id, children }: { id: string; children: React.ReactNode }) {
  const { translate } = useLanguage();
  return <>{translate(id, children)}</>;
}
