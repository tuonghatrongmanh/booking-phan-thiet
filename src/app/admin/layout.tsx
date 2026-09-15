import Providers from "@/components/admin/Providers";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
