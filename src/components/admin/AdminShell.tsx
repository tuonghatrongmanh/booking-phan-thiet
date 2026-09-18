"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NAV, isGroup, HREF_TO_SECTION, type NavEntry } from "@/lib/admin-nav";
import { getSectionPermission, type AdminPermissions } from "@/lib/admin-permissions";
import AdminContentHeader from "./AdminContentHeader";

const COLLAPSE_KEY = "bpt_admin_sidebar_collapsed";

export default function AdminShell({
  userName,
  role,
  permissions,
  children,
}: {
  userName?: string | null;
  role?: string;
  permissions?: AdminPermissions | null;
  children: React.ReactNode;
}) {
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Nhan vien (khong phai SuperAdmin): an muc "Tong quan" hoan toan, va an tung muc
  // con trong cac group ma khong co quyen truy cap (permission.access === false).
  // Group tro thanh rong sau khi loc thi cung an luon ca group.
  function filterNav(items: NavEntry[]): NavEntry[] {
    if (isSuperAdmin) return items;
    return items
      .filter((item) => !isGroup(item) && item.href === "/admin" ? false : true)
      .map((item) => {
        if (!isGroup(item)) return item;
        const children = item.children.filter((c) => {
          const section = HREF_TO_SECTION[c.href];
          if (!section) return false;
          return getSectionPermission(permissions, section).access;
        });
        return { ...item, children };
      })
      .filter((item) => (isGroup(item) ? item.children.length > 0 : true))
      .filter((item) => {
        if (isGroup(item)) return true;
        const section = HREF_TO_SECTION[item.href];
        if (!section) return false;
        return getSectionPermission(permissions, section).access;
      });
  }

  const visibleNav = filterNav(NAV);

  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const canAccessSiteSettings = isSuperAdmin || getSectionPermission(permissions, "settings").access;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of visibleNav) {
      if (isGroup(item) && item.children.some((c) => pathname.startsWith(c.href))) initial.add(item.label);
    }
    return initial;
  });

  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const item of visibleNav) {
        if (isGroup(item) && item.children.some((c) => pathname.startsWith(c.href))) next.add(item.label);
      }
      return next;
    });
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function toggleGroup(label: string) {
    if (collapsed) setCollapsed(false);
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const sidebarWidth = collapsed ? "lg:w-[76px]" : "lg:w-64";
  const contentMargin = collapsed ? "lg:ml-[76px]" : "lg:ml-64";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar - chi hien tren mobile/tablet (< lg), sidebar tren desktop da co logo+nut rieng */}
      <div className="lg:hidden sticky top-0 z-30 bg-brand-footer text-white flex items-center justify-between px-4 py-3 shadow-md">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu quản trị"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>
        <p className="font-display font-bold text-sm">
          BOOKING <span className="text-brand-gold">PHAN THIẾT</span>
        </p>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xem trang web"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
        >
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </Link>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-brand-footer text-white/80 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:transition-[width] lg:duration-200 w-72 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`flex items-center gap-2 border-b border-white/10 shrink-0 ${collapsed ? "lg:justify-center lg:px-2" : "px-5"} py-6`}>
          <div className="min-w-0 flex-1 lg:flex-initial">
            <p className={`font-display font-bold text-white text-lg leading-tight ${collapsed ? "lg:hidden" : ""}`}>BOOKING</p>
            <p className={`font-display font-bold text-brand-gold text-sm ${collapsed ? "lg:hidden" : ""}`}>PHAN THIẾT · Admin</p>
            <p className={`hidden ${collapsed ? "lg:block" : ""} font-display font-extrabold text-brand-gold text-lg text-center`}>BP</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition shrink-0"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {visibleNav.map((item) => {
            if (isGroup(item)) {
              const open = openGroups.has(item.label);
              const groupActive = item.children.some((c) => pathname.startsWith(c.href));
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                      collapsed ? "lg:justify-center lg:px-0" : ""
                    } ${groupActive ? "text-white" : "hover:bg-white/10"}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                      <path d={item.icon} />
                    </svg>
                    <span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                    {!collapsed && (
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {open && (
                    <div className={`mt-1 space-y-1 ${collapsed ? "lg:hidden" : "pl-6"}`}>
                      {item.children.map((child) => {
                        const active = pathname === child.href || pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition ${
                              active ? "bg-brand-blue text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${active ? "bg-brand-blue text-white" : "hover:bg-white/10"}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                  <path d={item.icon} />
                </svg>
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-white/10 py-4 shrink-0 ${collapsed ? "lg:px-2" : "px-5"}`}>
          <button
            type="button"
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setSettingsMenuOpen((o) => !o);
            }}
            title={collapsed ? "Cài đặt" : undefined}
            className={`w-full flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
            <span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>Cài đặt</span>
            {!collapsed && (
              <i
                className={`fa-solid fa-chevron-down text-[10px] transition-transform shrink-0 ${settingsMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            )}
          </button>
          {settingsMenuOpen && !collapsed && (
            <div className="mt-1 mb-2 space-y-1 pl-6">
              {canAccessSiteSettings && (
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  Cài đặt trang web
                </Link>
              )}
              <Link
                href="/admin/account"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                Tài khoản của tôi
              </Link>
              <a
                href="/admin#hoat-dong"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                Nhật ký hoạt động
              </a>
            </div>
          )}

          <p className={`text-xs text-white/50 mb-2 mt-3 truncate ${collapsed ? "lg:hidden" : ""}`}>{userName || "Quản trị viên"}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className={`text-sm font-semibold text-white/80 hover:text-white flex items-center gap-2 ${collapsed ? "lg:justify-center w-full" : ""}`}
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span className={collapsed ? "lg:hidden" : ""}>Đăng xuất</span>
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            className="hidden lg:flex items-center justify-center gap-2 w-full mt-4 pt-3 border-t border-white/10 text-white/60 hover:text-white text-xs font-semibold transition"
          >
            <i className={`fa-solid ${collapsed ? "fa-angles-right" : "fa-angles-left"}`} aria-hidden="true" />
            {!collapsed && "Thu gọn"}
          </button>
        </div>
      </aside>

      <main className={`transition-[margin] duration-200 min-w-0 ${contentMargin}`}>
        <AdminContentHeader userName={userName} />
        <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
