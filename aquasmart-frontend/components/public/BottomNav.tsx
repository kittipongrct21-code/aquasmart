"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// แนะนำให้ใช้ Icon จาก lucide-react หรือ heroicons ในโปรเจกต์จริง
const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/fish", label: "Search", icon: "🔍" },
  { href: "/identify", label: "Identify", icon: "📷", isCenter: true },
  { href: "/history", label: "History", icon: "📄" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full rounded-[28px] bg-white/95 px-3 py-3 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <ul className="flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`group flex flex-col items-center justify-center gap-1 rounded-3xl py-2 transition-all duration-200 ${
                  item.isCenter ? "-mt-6" : "hover:bg-slate-100"
                } ${isActive ? "bg-slate-100" : ""}`}
              >
                {item.isCenter ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                ) : (
                  <>
                    <span className={`text-xl ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[10px] font-semibold ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}