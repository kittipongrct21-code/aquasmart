"use client";

import Link from "next/link";
import AppShell from "@/components/public/AppShell";

const items = [
  { name: "Catfish", slug: "catfish" },
  { name: "Bangus", slug: "bangus" },
  { name: "Black Spotted Barb", slug: "black-spotted-barb" },
];

export default function InterestingPage() {
  return (
    <AppShell title="Interesting" subtitle="Favorite fish placeholder">
      <section className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/fish/${item.slug}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-600">
                Fish
              </div>
              <p className="min-w-0 truncate text-sm font-medium text-slate-800">{item.name}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">♡</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
