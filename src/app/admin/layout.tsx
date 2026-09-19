import Providers from "@/components/admin/Providers";
import { DEFAULT_THEME_VARS } from "@/lib/theme-colors";

// Khu vuc quan tri luon dung bang mau goc (xanh #003b95) du site dang bat giao dien le hoi
// (Tet/Trung thu...) - "contents" khong tao khung layout nhung van truyen bien CSS cho con.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="contents" style={DEFAULT_THEME_VARS as React.CSSProperties}>
      <Providers>{children}</Providers>
    </div>
  );
}
