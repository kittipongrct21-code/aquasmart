"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/public/BottomNav";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  hideHeader?: boolean;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/fish", label: "Search" },
  { href: "/identify", label: "Identify" },
  { href: "/history", label: "History" },
  { href: "/admin/fish", label: "Admin" },
];

export default function AppShell({
  children,
  title,
  subtitle,
  rightSlot,
  hideHeader = false,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    // บนมือถือพื้นหลังสีฟ้าอ่อน (#F4FBFF) ส่วนจอใหญ่ (md) จะเป็นสีเทาอ่อน (slate-50)
    <main className="flex min-h-[100dvh] flex-col bg-[#F4FBFF] font-sans text-slate-900 md:bg-slate-50">
      
      {/* ========================================= */}
      {/* 1. TOP NAVIGATION (แสดงเฉพาะบน Desktop: ซ่อนบนมือถือ) */}
      {/* ========================================= */}
      <header className="sticky top-0 z-50 hidden w-full border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🐟</span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                AquaSmart<span className="text-blue-600">ML</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              aria-label="Profile"
            >
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================= */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ========================================= */}
      <div className="relative mx-auto flex-1 w-full max-w-7xl pb-24 md:px-6 md:pb-10 md:pt-10">
        
        {/* Background Effect (เฉพาะ Desktop) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-96 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_60%)] md:block" />
        
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6 px-5 pt-6 md:px-0 md:pt-0">
          
          {/* HEADER สำหรับมือถือ (โครงสร้างดั้งเดิม) */}
          {!hideHeader && (title || subtitle || rightSlot) && (
            <header className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md md:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {title && <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h1>}
                  {subtitle && <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{subtitle}</p>}
                </div>
                {rightSlot}
              </div>
            </header>
          )}

          {/* HEADER สำหรับ Desktop (การ์ดใหญ่ๆ) */}
          {!hideHeader && (title || subtitle || rightSlot) && (
            <section className="hidden rounded-3xl border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:block">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {title && <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600/90">{title}</p>}
                  {subtitle && <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{subtitle}</h1>}
                </div>
                {rightSlot && <div className="shrink-0">{rightSlot}</div>}
              </div>
            </section>
          )}

          {/* ส่วนแสดงเนื้อหาหน้าต่างๆ (children) */}
          <div className="w-full space-y-6 md:space-y-8">
            {children}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. BOTTOM NAVIGATION (แสดงเฉพาะมือถือ: ซ่อนบนจอใหญ่) */}
      {/* ========================================= */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-gradient-to-t from-[#F4FBFF] from-60% to-transparent px-5 pb-6 pt-10 md:hidden">
        <BottomNav />
      </div>

    </main>
  );
}